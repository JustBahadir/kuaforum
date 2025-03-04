import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { nanoid } from 'nanoid';
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/authService";

interface ShopProfilePhotoUploadProps {
  children: React.ReactNode;
  dukkanId: number;
  galleryMode?: boolean;
  onSuccess: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export function ShopProfilePhotoUpload({ 
  children, 
  dukkanId, 
  galleryMode = false,
  onSuccess,
  currentImageUrl,
  className
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'ı geçemez');
      return;
    }

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const bucketName = galleryMode ? 'shop-photos' : 'photos';
      const filePath = `shops/${dukkanId}/${nanoid()}.${fileExt}`;
      
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
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
        } else {
          toast.error(`Yükleme hatası: ${error.message}`);
        }
        return;
      }
      
      const { data: publicUrl } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      if (galleryMode) {
        onSuccess(publicUrl.publicUrl);
        toast.success('Galeri fotoğrafı başarıyla yüklendi');
      } else {
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

  const handleRemovePhoto = async () => {
    try {
      if (galleryMode) {
        return;
      }
      
      const { error: updateError } = await supabase
        .from('dukkanlar')
        .update({ logo_url: null })
        .eq('id', dukkanId);
      
      if (updateError) {
        console.error('Dükkan logo silinirken hata:', updateError);
        toast.error('Dükkan logosu silinemedi: ' + updateError.message);
        return;
      }
      
      onSuccess('');
      toast.success('Dükkan fotoğrafı başarıyla kaldırıldı');
    } catch (error) {
      console.error('Fotoğraf silme hatası:', error);
      toast.error('Fotoğraf silinirken bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className={className}>
      <div 
        onClick={handleClick}
        className={`${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative`}
      >
        {children}
        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
            <div className="w-5 h-5 border-2 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </span>
        )}
      </div>
      
      {currentImageUrl && !galleryMode && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleRemovePhoto}
          className="mt-2"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Fotoğrafı Kaldır
        </Button>
      )}
    </div>
  );
}
