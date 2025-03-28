
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface FileUploadProps {
  id?: string;
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  bucketName?: string;
  folderPath?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // In bytes
}

export function FileUpload({
  id,
  onUploadComplete,
  currentImageUrl,
  label = "Resim Yükle",
  bucketName = "photos",
  folderPath = "avatars",
  acceptedFileTypes = "image/*",
  maxFileSize = 20 * 1024 * 1024 // Default to 20MB
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`Dosya boyutu çok büyük! Maksimum ${Math.round(maxFileSize / (1024 * 1024))}MB olmalıdır.`);
      return;
    }
    
    try {
      setIsUploading(true);
      
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
      
      // Call callback with the URL
      onUploadComplete(publicUrl);
      
      toast.success("Dosya başarıyla yüklendi");
    } catch (error: any) {
      console.error("Yükleme hatası:", error);
      toast.error(`Yükleme hatası: ${error.message || "Bilinmeyen bir hata oluştu"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onUploadComplete("");
  };

  const inputId = id || "file-upload";

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
          <Image className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">PNG, JPG, GIF dosyası yükleyin</p>
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
          disabled={isUploading}
        />
        <label htmlFor={inputId} className="flex-1">
          <Button 
            type="button" 
            className="w-full" 
            disabled={isUploading}
            variant={previewUrl ? "outline" : "default"}
            asChild
          >
            <span>
              {isUploading ? (
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
