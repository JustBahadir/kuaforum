import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Upload, X, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface FileUploadProps {
  id?: string;
  onUploadComplete: (file: File | string) => void | Promise<void> | Promise<string>;
  currentImageUrl?: string;
  label?: string;
  bucketName?: string;
  folderPath?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // In bytes
  useCamera?: boolean;
  isUploading?: boolean; // Added isUploading prop
}

export function FileUpload({
  id,
  onUploadComplete,
  currentImageUrl,
  label = "Resim Yükle",
  bucketName = "photos",
  folderPath = "avatars",
  acceptedFileTypes = "image/*",
  maxFileSize = 20 * 1024 * 1024, // Default to 20MB
  useCamera = false,
  isUploading = false // Default to false
}: FileUploadProps) {
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  // Use either the prop value or local state for uploading status
  const uploadingStatus = isUploading || isUploadingLocal;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`Dosya boyutu çok büyük! Maksimum ${Math.round(maxFileSize / (1024 * 1024))}MB olmalıdır.`);
      return;
    }
    
    try {
      setIsUploadingLocal(true);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });
      
      if (error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error('Depolama alanı bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.');
        } else {
          throw error;
        }
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      
      // Update preview
      setPreviewUrl(publicUrl);
      
      // Call callback with the file - allowing for various return types
      await onUploadComplete(file);
      
      toast.success("Dosya başarıyla yüklendi");
    } catch (error: any) {
      console.error("Yükleme hatası:", error);
      toast.error(`Yükleme hatası: ${error.message || "Bilinmeyen bir hata oluştu"}`);
    } finally {
      setIsUploadingLocal(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onUploadComplete("");
  };

  const inputId = id || "file-upload";

  // Modify the input to use capture if useCamera is true
  // Fix: Use the correct type for capture attribute - "environment" | "user" instead of string
  const inputProps = useCamera ? { capture: "environment" as "environment" | "user" } : {};

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Yüklenen görsel" 
            className="w-full h-48 object-cover rounded-md"
          />
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={clearImage}
            title="Fotoğrafı kaldır"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center h-48 bg-gray-50">
          {useCamera ? (
            <Camera className="h-10 w-10 text-gray-400 mb-2" />
          ) : (
            <Image className="h-10 w-10 text-gray-400 mb-2" />
          )}
          <p className="text-sm text-gray-500">{useCamera ? "Kamera ile fotoğraf çekin" : "PNG, JPG, GIF dosyası yükleyin"}</p>
          <p className="text-xs text-gray-400 mt-1">Max {Math.round(maxFileSize / (1024 * 1024))}MB</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
          id={inputId}
          disabled={uploadingStatus}
          {...inputProps}
        />
        <label htmlFor={inputId} className="flex-1">
          <Button 
            type="button" 
            className="w-full" 
            disabled={uploadingStatus}
            variant={previewUrl ? "outline" : "default"}
            asChild
          >
            <span>
              {uploadingStatus ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {previewUrl ? "Değiştir" : label}
                </>
              )}
            </span>
          </Button>
        </label>
        
        {previewUrl && (
          <Button 
            variant="destructive"
            onClick={clearImage}
            title="Fotoğrafı kaldır"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Kaldır
          </Button>
        )}
      </div>
    </div>
  );
}
