
import { useState, useEffect } from "react";
import { Camera, Upload, X, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';

// Add ImageCapture type definition
declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  
  class ImageCapture {
    constructor(track: MediaStreamTrack);
    takePhoto(): Promise<Blob>;
    getPhotoCapabilities(): Promise<MediaTrackCapabilities>;
  }
}

interface OperationPhotoUploadProps {
  existingPhotos: string[];
  onPhotosUpdated: (photos: string[]) => void;
  maxPhotos?: number;
}

export function OperationPhotoUpload({ 
  existingPhotos = [], 
  onPhotosUpdated,
  maxPhotos = 4 
}: OperationPhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imageCapture, setImageCapture] = useState<ImageCapture | null>(null);

  useEffect(() => {
    setPhotos(existingPhotos);
  }, [existingPhotos]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const totalPhotos = photos.length + e.target.files.length;
    if (totalPhotos > maxPhotos) {
      toast.error(`En fazla ${maxPhotos} fotoğraf yükleyebilirsiniz`);
      return;
    }

    setUploading(true);
    
    try {
      const newPhotos = [...photos];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('operation-photos')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('operation-photos')
          .getPublicUrl(filePath);
          
        newPhotos.push(data.publicUrl);
      }
      
      setPhotos(newPhotos);
      onPhotosUpdated(newPhotos);
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capture = new ImageCapture(videoTrack);
        setImageCapture(capture);
      }
      
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Kameraya erişim sağlanamadı');
    }
  };

  const takePicture = async () => {
    if (!imageCapture) return;
    
    if (photos.length >= maxPhotos) {
      toast.error(`En fazla ${maxPhotos} fotoğraf yükleyebilirsiniz`);
      stopCamera();
      return;
    }
    
    try {
      setUploading(true);
      const blob = await imageCapture.takePhoto();
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('operation-photos')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('operation-photos')
        .getPublicUrl(filePath);
        
      const newPhotos = [...photos, data.publicUrl];
      setPhotos(newPhotos);
      onPhotosUpdated(newPhotos);
      
      if (newPhotos.length >= maxPhotos) {
        stopCamera();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast.error('Fotoğraf çekilirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleRemovePhoto = async (url: string) => {
    try {
      // Extract filename from URL
      const fileName = url.split('/').pop();
      if (fileName) {
        // Attempt to delete from storage - may fail if same file is used elsewhere
        try {
          await supabase.storage
            .from('operation-photos')
            .remove([fileName]);
        } catch (err) {
          console.log('File may be used elsewhere or not exist:', err);
        }
      }
      
      const updatedPhotos = photos.filter(photo => photo !== url);
      setPhotos(updatedPhotos);
      onPhotosUpdated(updatedPhotos);
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Fotoğraf silinirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-4">
      {showCamera ? (
        <div className="relative">
          <video 
            autoPlay 
            playsInline
            ref={(video) => {
              if (video && stream) {
                video.srcObject = stream;
              }
            }}
            className="w-full rounded-lg border shadow-sm"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button 
              variant="default" 
              onClick={takePicture} 
              disabled={uploading}
              className="mx-2"
            >
              <Camera className="h-5 w-5 mr-2" />
              {uploading ? 'Kaydediliyor...' : 'Fotoğraf Çek'}
            </Button>
            <Button 
              variant="outline" 
              onClick={stopCamera} 
              className="mx-2"
            >
              <X className="h-5 w-5 mr-2" />
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              onClick={startCamera}
              disabled={uploading || photos.length >= maxPhotos}
              className="h-32 w-32"
            >
              <div className="flex flex-col items-center">
                <Camera className="h-8 w-8 mb-2" />
                <span>Kamera</span>
              </div>
            </Button>
            <div className="flex justify-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
                disabled={uploading || photos.length >= maxPhotos}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (photos.length < maxPhotos) {
                    document.getElementById('photo-upload')?.click();
                  } else {
                    toast.error(`En fazla ${maxPhotos} fotoğraf yükleyebilirsiniz`);
                  }
                }}
                disabled={uploading || photos.length >= maxPhotos}
                className="h-10 w-32"
              >
                <Upload className="h-4 w-4 mr-2" />
                Yükle
              </Button>
            </div>
          </div>
          
          {photos.length > 0 ? (
            photos.map((photoUrl, index) => (
              <Card key={index} className="relative h-32 w-32 overflow-hidden">
                <CardContent className="p-0">
                  <img 
                    src={photoUrl} 
                    alt={`İşlem fotoğrafı ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemovePhoto(photoUrl)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 w-32 border border-dashed rounded-lg">
              <div className="text-center text-gray-400">
                <ImagePlus className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Fotoğraf yok</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!showCamera && (
        <p className="text-xs text-gray-500">
          {photos.length}/{maxPhotos} fotoğraf ({maxPhotos - photos.length} daha ekleyebilirsiniz)
        </p>
      )}
    </div>
  );
}
