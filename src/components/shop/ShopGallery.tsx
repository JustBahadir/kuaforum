
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";

interface ShopGalleryProps {
  dukkanId: number;
}

export function ShopGallery({ dukkanId }: ShopGalleryProps) {
  const { userRole } = useCustomerAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data: photos = [], isLoading, error } = useQuery({
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
        
        // Get public URLs for all photos
        const photoUrls = await Promise.all(
          data
            .filter(file => file.name.match(/\.(jpeg|jpg|gif|png)$/i))
            .map(async (file) => {
              const { data: { publicUrl } } = supabase.storage
                .from('shop-photos')
                .getPublicUrl(`shops/${dukkanId}/${file.name}`);
              
              return {
                name: file.name,
                url: publicUrl,
                path: `shops/${dukkanId}/${file.name}`
              };
            })
        );
        
        return photoUrls;
      } catch (error) {
        console.error("Galeri fotoğrafları alınırken hata:", error);
        throw error;
      }
    }
  });
  
  const handleDeletePhoto = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('shop-photos')
        .remove([path]);
      
      if (error) {
        toast.error(`Fotoğraf silinirken hata: ${error.message}`);
        throw error;
      }
      
      // Close the dialog and refetch photos
      setSelectedImage(null);
      toast.success("Fotoğraf başarıyla silindi");
      // Refetch photos
      document.location.reload();
    } catch (error) {
      console.error("Fotoğraf silinirken hata:", error);
      toast.error(`Fotoğraf silinirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
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

  if (photos.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Henüz galeri fotoğrafı eklenmemiş.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="aspect-square rounded-md overflow-hidden relative group cursor-pointer"
            onClick={() => setSelectedImage(photo.url)}
          >
            <img 
              src={photo.url} 
              alt={`Galeri Fotoğrafı ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <img 
              src={selectedImage || ''} 
              alt="Seçilen galeri fotoğrafı" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full" 
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {userRole === 'admin' && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  variant="destructive"
                  onClick={() => {
                    const photoPath = photos.find(p => p.url === selectedImage)?.path;
                    if (photoPath) {
                      handleDeletePhoto(photoPath);
                    }
                  }}
                >
                  Fotoğrafı Sil
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
