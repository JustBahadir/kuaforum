
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Trash, Play } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  url: string;
  path: string;
  type: 'image' | 'video';
}

interface ShopGalleryProps {
  dukkanId: number;
}

export function ShopGallery({ dukkanId }: ShopGalleryProps) {
  const { userRole } = useCustomerAuth();
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  
  const { data: mediaFiles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['shop-photos', dukkanId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.storage
          .from('shop-photos')
          .list(`shops/${dukkanId}`, {
            sortBy: { column: 'created_at', order: 'desc' },
          });
        
        if (error) {
          if (error.message.includes('bucket not found')) {
            throw new Error('Depolama alanı bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.');
          }
          throw error;
        }
        
        // Get public URLs for all media files
        const mediaUrls = await Promise.all(
          data
            .filter(file => 
              file.name.match(/\.(jpeg|jpg|gif|png|mp4|webm|ogg|mov)$/i))
            .map(async (file) => {
              const { data: { publicUrl } } = supabase.storage
                .from('shop-photos')
                .getPublicUrl(`shops/${dukkanId}/${file.name}`);
              
              // Determine if it's a video or image
              const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
              const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt);
              
              return {
                name: file.name,
                url: publicUrl,
                path: `shops/${dukkanId}/${file.name}`,
                type: isVideo ? 'video' : 'image' as 'image' | 'video'
              };
            })
        );
        
        return mediaUrls;
      } catch (error) {
        console.error("Galeri medya dosyaları alınırken hata:", error);
        throw error;
      }
    }
  });
  
  const handleDeleteMedia = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('shop-photos')
        .remove([path]);
      
      if (error) {
        toast.error(`Medya dosyası silinirken hata: ${error.message}`);
        throw error;
      }
      
      // Close the dialog and refetch media files
      setSelectedMedia(null);
      toast.success("Medya dosyası başarıyla silindi");
      refetch();
    } catch (error) {
      console.error("Medya dosyası silinirken hata:", error);
      toast.error(`Medya dosyası silinirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Galeri yüklenirken bir hata oluştu: {error instanceof Error ? error.message : 'Bilinmeyen hata'}
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Henüz galeri fotoğrafı veya videosu eklenmemiş.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {mediaFiles.map((media, index) => (
          <div 
            key={index} 
            className="aspect-square rounded-md overflow-hidden relative group cursor-pointer"
            onClick={() => setSelectedMedia(media)}
          >
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt={`Galeri Fotoğrafı ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="relative w-full h-full bg-gray-900">
                <video 
                  src={media.url} 
                  className="w-full h-full object-cover"
                  muted 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-40 rounded-full p-3">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            {selectedMedia?.type === 'image' ? (
              <img 
                src={selectedMedia?.url || ''} 
                alt="Seçilen galeri fotoğrafı" 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            ) : (
              <video 
                src={selectedMedia?.url || ''} 
                controls 
                autoPlay 
                className="w-full h-auto max-h-[80vh]"
              >
                Tarayıcınız video desteklemiyor.
              </video>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full" 
              onClick={() => setSelectedMedia(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {userRole === 'admin' && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (selectedMedia) {
                      handleDeleteMedia(selectedMedia.path);
                    }
                  }}
                >
                  <Trash className="h-5 w-5" />
                  {selectedMedia?.type === 'image' ? 'Fotoğrafı Sil' : 'Videoyu Sil'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
