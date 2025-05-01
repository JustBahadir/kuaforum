
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { nanoid } from 'nanoid';
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/authService";
import { setupStorageBuckets } from "@/lib/supabase/setupStorage";

interface ShopProfilePhotoUploadProps {
  children: React.ReactNode;
  dukkanId: number;
  galleryMode?: boolean;
  onSuccess: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
  updateUserProfile?: boolean;
  acceptVideoFiles?: boolean;
}

export function ShopProfilePhotoUpload({ 
  children, 
  dukkanId, 
  galleryMode = false,
  onSuccess,
  currentImageUrl,
  className,
  updateUserProfile = true,
  acceptVideoFiles = false
}: ShopProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Ensure buckets exist on component mount
  useEffect(() => {
    setupStorageBuckets().catch(console.error);
  }, []);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    
    // Accept videos if galleryMode and acceptVideoFiles are both true
    if (galleryMode && acceptVideoFiles) {
      input.accept = 'image/*, video/mp4, video/webm, video/ogg';
    } else {
      input.accept = 'image/*';
    }
    
    input.onchange = handleFileChange;
    input.click();
  };

  const handleFileChange = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check if the file is an image or a video
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!(isImage || (acceptVideoFiles && isVideo && galleryMode))) {
      toast.error('Lütfen sadece resim veya video dosyası yükleyin');
      return;
    }

    // 20MB limit for all files
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Dosya boyutu 20MB\'ı geçemez');
      return;
    }

    try {
      setIsUploading(true);
      
      // Ensure storage buckets exist before uploading
      await setupStorageBuckets();
      
      const fileExt = file.name.split('.').pop();
      const bucketName = galleryMode ? 'shop-photos' : 'profile-photos';
      
      const filePath = `${dukkanId ? `shops/${dukkanId}/` : ''}${nanoid()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Upload error:", error);
        toast.error(`Yükleme hatası: ${error.message}`);
        return;
      }
      
      const { data: publicUrl } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      if (galleryMode) {
        onSuccess(publicUrl.publicUrl);
        toast.success(isVideo ? 'Galeri videosu başarıyla yüklendi' : 'Galeri fotoğrafı başarıyla yüklendi');
      } else {
        // Only update shop logo for images, not videos
        if (dukkanId) {
          const { error: updateError } = await supabase
            .from('dukkanlar')
            .update({ logo_url: publicUrl.publicUrl })
            .eq('id', dukkanId);
          
          if (updateError) {
            console.error("Logo update error:", updateError);
            toast.error(`Logo güncellenemedi: ${updateError.message}`);
            return;
          }
        }

        // Also update user profile avatar if needed
        if (updateUserProfile) {
          try {
            const user = await authService.getCurrentUser();
            if (user) {
              await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl.publicUrl })
                .eq('id', user.id);
            }
          } catch (err) {
            console.error('Profil avatar güncellenemedi:', err);
            // Don't show error toast here since the shop logo was still updated
          }
        }
        
        onSuccess(publicUrl.publicUrl);
        toast.success('Profil fotoğrafı başarıyla güncellendi');
      }
    } catch (error: any) {
      console.error('Yükleme işlemi sırasında hata:', error);
      toast.error('Dosya yüklenirken bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      if (galleryMode) {
        return;
      }
      
      if (dukkanId) {
        const { error: updateError } = await supabase
          .from('dukkanlar')
          .update({ logo_url: null })
          .eq('id', dukkanId);
        
        if (updateError) {
          console.error('Dükkan logo silinirken hata:', updateError);
          toast.error('Dükkan logosu silinemedi: ' + updateError.message);
          return;
        }
      }

      // Also update user profile avatar if needed
      if (updateUserProfile) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({ avatar_url: null })
              .eq('id', user.id);
          }
        } catch (err) {
          console.error('Profil avatar silinirken hata:', err);
        }
      }
      
      onSuccess('');
      toast.success('Profil fotoğrafı başarıyla kaldırıldı');
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
