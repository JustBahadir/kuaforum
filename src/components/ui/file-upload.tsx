
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  id?: string;
  onUploadComplete: (file: File | string) => void | Promise<void> | Promise<string>;
  currentImageUrl?: string;
  label?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // In bytes
  isUploading?: boolean; 
  children?: React.ReactNode;
}

export function FileUpload({
  id,
  onUploadComplete,
  currentImageUrl,
  label = "Resim Yükle",
  acceptedFileTypes = "image/*",
  maxFileSize = 20 * 1024 * 1024, // Default to 20MB
  isUploading = false,
  children
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`Dosya boyutu çok büyük! Maksimum ${Math.round(maxFileSize / (1024 * 1024))}MB olmalıdır.`, {
        position: "bottom-right"
      });
      return;
    }
    
    try {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Call callback with the file
      await onUploadComplete(file);
    } catch (error: any) {
      console.error("Yükleme hatası:", error);
      toast.error(`Yükleme hatası: ${error.message || "Bilinmeyen bir hata oluştu"}`, {
        position: "bottom-right"
      });
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onUploadComplete("");
  };

  const inputId = id || "file-upload";

  return (
    <div className="space-y-2">
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
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
      
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
          {children || (
            <Button 
              type="button" 
              className="w-full" 
              disabled={isUploading}
              variant={previewUrl ? "outline" : "default"}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Yükleniyor...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  {previewUrl ? "Değiştir" : label}
                </span>
              )}
            </Button>
          )}
        </label>
        
        {previewUrl && !children && (
          <Button 
            variant="destructive"
            onClick={clearImage}
            title="Fotoğrafı kaldır"
            type="button"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Kaldır
          </Button>
        )}
      </div>
    </div>
  );
}
