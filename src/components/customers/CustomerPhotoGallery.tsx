
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CustomerPhotoGalleryProps {
  customerId?: number;
}

export function CustomerPhotoGallery({ customerId }: CustomerPhotoGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [viewPhotoDetails, setViewPhotoDetails] = useState<any>(null);
  
  const { data: customerOperations = [], isLoading } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      try {
        const result = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
        return result;
      } catch (error) {
        console.error("Error fetching customer operations:", error);
        return [];
      }
    },
    enabled: !!customerId,
    refetchOnWindowFocus: false
  });
  
  // Extract all photos with operations details
  const allPhotos = customerOperations.flatMap(op => {
    if (!op.photos || op.photos.length === 0) return [];
    
    return op.photos.map((photoPath: string) => ({
      path: photoPath,
      operationId: op.id,
      serviceName: op.islem?.islem_adi || op.aciklama,
      staffName: op.personel?.ad_soyad || 'Belirtilmemiş',
      date: new Date(op.created_at),
      notes: op.notlar || '',
      operation: op
    }));
  });
  
  // Sort photos by date (newest first)
  allPhotos.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Filter photos by search
  const filteredPhotos = searchQuery.trim()
    ? allPhotos.filter(photo => {
        const searchText = `${photo.serviceName} ${photo.staffName} ${photo.notes} ${format(photo.date, 'dd MMMM yyyy', { locale: tr })}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    : allPhotos;
  
  const handleViewPhoto = async (photo: any) => {
    try {
      // Get the public URL for the photo
      const { data } = supabase.storage
        .from('customer-photos')
        .getPublicUrl(photo.path);
        
      if (data?.publicUrl) {
        setViewPhoto(data.publicUrl);
        setViewPhotoDetails(photo);
      }
    } catch (error) {
      console.error("Error getting photo URL:", error);
      toast.error("Fotoğraf görüntülenirken bir hata oluştu");
    }
  };
  
  const handleDownloadPhoto = async (photo: any) => {
    try {
      // Get the public URL for the photo
      const { data } = supabase.storage
        .from('customer-photos')
        .getPublicUrl(photo.path);
        
      if (data?.publicUrl) {
        const link = document.createElement('a');
        link.href = data.publicUrl;
        
        // Extract filename from path
        const fileName = photo.path.split('/').pop() || 'photo.jpg';
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading photo:", error);
      toast.error("Fotoğraf indirilirken bir hata oluştu");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (allPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Bu müşteriye ait fotoğraf bulunmamaktadır.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fotoğraf Galerisi</h3>
        
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Fotoğrafları ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Arama kriterlerinize uygun fotoğraf bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo, index) => {
            const photoUrl = supabase.storage
              .from('customer-photos')
              .getPublicUrl(photo.path).data.publicUrl;
              
            return (
              <div 
                key={`${photo.path}-${index}`} 
                className="group relative rounded-md overflow-hidden border bg-card"
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img 
                    src={photoUrl} 
                    alt={photo.serviceName} 
                    className="h-full w-full object-cover transition-all group-hover:scale-105"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="text-white text-xs line-clamp-2 font-medium">
                    {photo.serviceName}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-white/80 text-xs">
                      {format(photo.date, 'dd MMM yyyy', { locale: tr })}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-7 w-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                        onClick={() => handleViewPhoto(photo)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-7 w-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                        onClick={() => handleDownloadPhoto(photo)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <Dialog open={!!viewPhoto} onOpenChange={(open) => !open && setViewPhoto(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewPhotoDetails?.serviceName || 'Fotoğraf Detayı'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3 aspect-square rounded-md overflow-hidden">
              {viewPhoto && (
                <img 
                  src={viewPhoto} 
                  alt="Detaylı görünüm" 
                  className="h-full w-full object-contain bg-black/5"
                />
              )}
            </div>
            
            <div className="md:col-span-2 space-y-3">
              {viewPhotoDetails && (
                <>
                  <div>
                    <div className="text-sm font-medium">İşlem</div>
                    <div>{viewPhotoDetails.serviceName}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Personel</div>
                    <div>{viewPhotoDetails.staffName}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Tarih</div>
                    <div>{format(viewPhotoDetails.date, 'dd MMMM yyyy HH:mm', { locale: tr })}</div>
                  </div>
                  
                  {viewPhotoDetails.notes && (
                    <div>
                      <div className="text-sm font-medium">Notlar</div>
                      <div className="text-sm whitespace-pre-line">{viewPhotoDetails.notes}</div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleDownloadPhoto(viewPhotoDetails)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
