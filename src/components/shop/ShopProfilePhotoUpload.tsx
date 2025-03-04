
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { nanoid } from 'nanoid';
import { toast } from "sonner";

interface ShopProfilePhotoUploadProps {
  children: React.ReactNode;
  dukkanId: number;
  galleryMode?: boolean;
  onSuccess: (url: string) => void;
}

export function ShopProfilePhotoUpload({ 
  children, 
  dukkanId, 
  galleryMode = false,
  onSuccess 
}: ShopProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileChange;
    input.click();
  };

  const handleFileChange = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece resim dosyası yükleyin');
      return;
    }

    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'ı geçemez');
      return;
    }

    try {
      setIsUploading(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const bucketName = galleryMode ? 'shop-photos' : 'photos';
      const filePath = `shops/${dukkanId}/${nanoid()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Yükleme hatası:', error);
        if (error.message.includes('Bucket not found')) {
          toast.error('Depolama alanı bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.');
        } else {
          toast.error(`Yükleme hatası: ${error.message}`);
        }
        return;
      }
      
      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      if (galleryMode) {
        onSuccess(publicUrl.publicUrl);
        toast.success('Galeri fotoğrafı başarıyla yüklendi');
      } else {
        // Update shop's logo_url
        const { error: updateError } = await supabase
          .from('dukkanlar')
          .update({ logo_url: publicUrl.publicUrl })
          .eq('id', dukkanId);
        
        if (updateError) {
          console.error('Dükkan logo güncellenemedi:', updateError);
          toast.error('Dükkan logosu güncellenemedi: ' + updateError.message);
          return;
        }
        
        onSuccess(publicUrl.publicUrl);
        toast.success('Dükkan fotoğrafı başarıyla güncellendi');
      }
    } catch (error) {
      console.error('Yükleme işlemi sırasında hata:', error);
      toast.error('Fotoğraf yüklenirken bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className={isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    >
      {children}
      {isUploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
          <div className="w-5 h-5 border-2 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </span>
      )}
    </div>
  );
}
