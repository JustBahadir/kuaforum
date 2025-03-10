import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface OperationPhotoUploadProps {
  existingPhotos?: string[];
  onPhotosUpdated: (photos: string[]) => Promise<void>;
  maxPhotos?: number;
}

export function OperationPhotoUpload({ 
  existingPhotos = [], 
  onPhotosUpdated,
  maxPhotos = 4
}: OperationPhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const remainingSlots = maxPhotos - existingPhotos.length;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && remainingSlots > 0) {
      // Only take up to the remaining slots
      const filesArray = Array.from(e.target.files).slice(0, remainingSlots);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = async (photoUrl: string) => {
    try {
      // Extract the file path from the URL
      const path = photoUrl.split('/').slice(-2).join('/');
      
      // Delete from storage
      const { error } = await supabase.storage
        .from('operation-photos')
        .remove([path]);
      
      if (error) throw error;
      
      // Update the parent component with the new list of photos
      const updatedPhotos = existingPhotos.filter(p => p !== photoUrl);
      await onPhotosUpdated(updatedPhotos);
      
      toast.success("Fotoğraf silindi");
    } catch (error) {
      console.error("Fotoğraf silinirken hata oluştu:", error);
      toast.error("Fotoğraf silinirken bir hata oluştu");
    }
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${Date.now()}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('operation-photos')
          .upload(filePath, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('operation-photos')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(urlData.publicUrl);
      }
      
      // Combine existing and new photos
      const allPhotos = [...existingPhotos, ...uploadedUrls];
      
      // Update parent component
      await onPhotosUpdated(allPhotos);
      
      // Reset state
      setSelectedFiles([]);
      setPreviewUrls([]);
      toast.success("Fotoğraflar başarıyla yüklendi");
    } catch (error) {
      console.error("Fotoğraf yüklenirken hata:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoOption = () => {
    setPhotoDialogOpen(true);
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef) {
        videoRef.srcObject = stream;
        videoRef.play();
      }
    } catch (error) {
      console.error("Kamera erişiminde hata:", error);
      toast.error("Kamera erişiminde bir hata oluştu");
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFiles(prev => [...prev, file]);
          
          const previewUrl = URL.createObjectURL(blob);
          setPreviewUrls(prev => [...prev, previewUrl]);
        }
      }, 'image/jpeg');
    }
    
    // Stop the camera
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef && videoRef.srcObject) {
      const stream = videoRef.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.srcObject = null;
    }
    setCameraActive(false);
    setPhotoDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">İşlem Fotoğrafları</h3>
        <div className="flex gap-2">
          {remainingSlots > 0 && (
            <Button 
              onClick={handlePhotoOption} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <ImagePlus className="h-4 w-4" />
              Fotoğraf Ekle
            </Button>
          )}
          
          {selectedFiles.length > 0 && (
            <Button 
              onClick={uploadPhotos} 
              disabled={uploading} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          )}
        </div>
      </div>
      
      {/* Photo grid - display in a nice grid based on how many photos */}
      <div className={`grid gap-2 ${existingPhotos.length + previewUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Existing photos */}
        {existingPhotos.map((photoUrl, idx) => (
          <div key={`existing-${idx}`} className="relative aspect-square group">
            <img
              src={photoUrl}
              alt={`İşlem fotoğrafı ${idx + 1}`}
              className="h-full w-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => removeExistingPhoto(photoUrl)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {/* Preview of selected files */}
        {previewUrls.map((url, idx) => (
          <div key={`preview-${idx}`} className="relative aspect-square group">
            <img
              src={url}
              alt="Preview"
              className="h-full w-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => removeFile(idx)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Photo option dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fotoğraf Ekle</DialogTitle>
          </DialogHeader>
          
          {!cameraActive ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button 
                variant="outline" 
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-6 h-32"
              >
                <Camera className="h-8 w-8 mb-2" />
                <span>Kamera</span>
              </Button>
              
              <label className="flex flex-col items-center justify-center p-6 h-32 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <ImagePlus className="h-8 w-8 mb-2" />
                <span>Galeriden Seç</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange} 
                  disabled={uploading}
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <video 
                ref={ref => setVideoRef(ref)} 
                className="w-full rounded-md"
                autoPlay 
                muted 
                playsInline
              />
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                >
                  İptal
                </Button>
                <Button
                  variant="default"
                  onClick={takePhoto}
                >
                  Fotoğraf Çek
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
