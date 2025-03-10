import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface OperationPhotoUploadProps {
  existingPhotos?: string[];
  onPhotosUpdated: (photos: string[]) => Promise<void>;
}

export function OperationPhotoUpload({ 
  existingPhotos = [], 
  onPhotosUpdated 
}: OperationPhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">İşlem Fotoğrafları</h3>
        {selectedFiles.length > 0 && (
          <Button 
            onClick={uploadPhotos} 
            disabled={uploading} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Yükleniyor..." : "Fotoğrafları Yükle"}
          </Button>
        )}
      </div>
      
      {/* File input */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="border-2 border-dashed rounded-md p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
          <ImagePlus className="h-8 w-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Fotoğraf Ekle</span>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={uploading}
          />
        </label>
        
        {/* Preview of selected files */}
        {previewUrls.map((url, idx) => (
          <div key={`preview-${idx}`} className="relative h-32 group">
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
        
        {/* Existing photos */}
        {existingPhotos.map((photoUrl, idx) => (
          <div key={`existing-${idx}`} className="relative h-32 group">
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
      </div>
    </div>
  );
}
