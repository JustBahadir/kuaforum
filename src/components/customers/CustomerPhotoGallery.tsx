
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Search, Maximize2, Image, ImageIcon } from "lucide-react";

interface CustomerPhotoGalleryProps {
  customerId?: number;
}

export function CustomerPhotoGallery({ customerId }: CustomerPhotoGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoDetailOpen, setPhotoDetailOpen] = useState(false);

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      return customerOperationsService.getCustomerOperations(customerId);
    },
    enabled: !!customerId,
    staleTime: 10000,
  });

  // Filter operations that have photos
  const operationsWithPhotos = operations.filter(op => op.photos && op.photos.length > 0);

  // Search functionality
  const filteredOperations = searchQuery
    ? operationsWithPhotos.filter(op => {
        const searchLower = searchQuery.toLowerCase();
        const serviceName = (op.islem?.islem_adi || op.service_name || op.aciklama || '').toLowerCase();
        const dateStr = op.date || op.created_at;
        const formattedDate = dateStr ? format(new Date(dateStr), 'dd MMMM yyyy', { locale: tr }).toLowerCase() : '';
        
        return serviceName.includes(searchLower) || formattedDate.includes(searchLower);
      })
    : operationsWithPhotos;

  // Open photo detail
  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        <span className="ml-2">Fotoğraflar yükleniyor...</span>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Müşteri seçilmedi.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ImageIcon className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-medium">Müşteri Fotoğraf Galerisi</h2>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="İşlem adı veya tarih ile ara..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredOperations.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium mb-1">Fotoğraf Bulunamadı</h3>
          <p className="text-gray-500">
            {operationsWithPhotos.length === 0 
              ? "Bu müşteriye ait kayıtlı fotoğraf bulunmamaktadır."
              : "Aramanızla eşleşen fotoğraf bulunamadı."}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOperations.map((operation) => (
          <Card key={operation.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="mb-3">
                <p className="text-sm font-medium">
                  {operation.islem?.islem_adi || operation.service_name || operation.aciklama}
                </p>
                <p className="text-xs text-gray-500">
                  {(operation.date || operation.created_at) && 
                    format(new Date(operation.date || operation.created_at), 'dd MMMM yyyy', { locale: tr })}
                </p>
                {(operation.notes || operation.notlar) && (
                  <p className="text-xs mt-1 italic text-gray-600">{operation.notes || operation.notlar}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {operation.photos?.map((photo: string, index: number) => (
                  <div 
                    key={index} 
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-md group"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <img 
                      src={photo} 
                      alt={`İşlem fotoğrafı ${index + 1}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={photoDetailOpen} onOpenChange={setPhotoDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Fotoğraf Detayı</DialogTitle>
            <DialogDescription>
              Fotoğrafı tam boyutta görüntülüyorsunuz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            {selectedPhoto && (
              <img 
                src={selectedPhoto} 
                alt="Fotoğraf detayı"
                className="w-full max-h-[70vh] object-contain rounded-md"
              />
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setPhotoDetailOpen(false)}>
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
