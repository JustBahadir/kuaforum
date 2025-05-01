
import React, { useState } from "react";
import { toast } from "sonner";
import { uploadToSupabase } from "@/lib/supabase/storage";

export interface ShopProfilePhotoUploadProps {
  dukkanId: number;
  onSuccess: (url: string) => Promise<void>;
  currentImageUrl?: string;
  children: React.ReactNode; // Required children prop
}

export function ShopProfilePhotoUpload({
  dukkanId,
  onSuccess,
  currentImageUrl,
  children
}: ShopProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen sadece JPEG, PNG ve GIF formatında resimler yükleyin");
      return;
    }
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Resim dosyası 2MB'dan küçük olmalıdır");
      return;
    }
    
    setIsUploading(true);
    try {
      // Create a folder path for shop logos
      const folderPath = `shop-logos/${dukkanId}`;
      const fileName = `logo-${Date.now()}`;
      
      // Upload the file to Supabase Storage
      const url = await uploadToSupabase(file, folderPath, fileName);
      
      // Call the onSuccess callback with the uploaded URL
      await onSuccess(url);
    } catch (error) {
      console.error("Logo yükleme hatası:", error);
      toast.error(`Yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <label className="cursor-pointer relative">
      {isUploading && (
        <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-white border-white/30 rounded-full animate-spin"></div>
        </div>
      )}
      {children}
      <input
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif"
        disabled={isUploading}
      />
    </label>
  );
}
