
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface OperationPhotoUploadProps {
  onPhotosUpdated: (urls: string[]) => void;
  existingPhotos?: string[];
  maxPhotos?: number;
}

export function OperationPhotoUpload({
  onPhotosUpdated,
  existingPhotos = [],
  maxPhotos = 4
}: OperationPhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`En fazla ${maxPhotos} fotoğraf yükleyebilirsiniz`);
      return;
    }

    const newPhotos: string[] = [...photos];

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `operation_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('appointment_photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('appointment_photos')
          .getPublicUrl(filePath);

        newPhotos.push(publicUrl);
      } catch (error: any) {
        toast.error(`Fotoğraf yüklenirken hata oluştu: ${error.message}`);
      }
    }

    setPhotos(newPhotos);
    onPhotosUpdated(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosUpdated(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={photo}
              alt={`Operation photo ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {photos.length < maxPhotos && (
        <div className="flex gap-2">
          <input
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
          />
          <label htmlFor="photo-upload" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Fotoğraf Yükle
              </span>
            </Button>
          </label>
          <input
            type="file"
            id="camera-upload"
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
          />
          <label htmlFor="camera-upload">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <span>
                <Camera className="h-4 w-4 mr-2" />
                Kamera
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
