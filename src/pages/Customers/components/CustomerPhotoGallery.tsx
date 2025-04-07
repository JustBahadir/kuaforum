
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Search, X, Calendar, User, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { CustomerOperation } from "@/lib/supabase/services/customerOperationsService";
import { formatCurrency } from "@/lib/utils";

interface CustomerPhotoGalleryProps {
  customerId?: number;
}

export function CustomerPhotoGallery({ customerId }: CustomerPhotoGalleryProps) {
  const { operations } = useCustomerOperations(customerId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperation, setSelectedOperation] = useState<CustomerOperation | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);

  // Find operations with photos
  const operationsWithPhotos = operations
    .filter(op => op.photos && op.photos.length > 0)
    .sort((a, b) => {
      const dateA = a.date || a.created_at;
      const dateB = b.date || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  // Filter by search query if provided
  const filteredOperations = searchQuery
    ? operationsWithPhotos.filter(op => {
        const serviceName = op.islem?.islem_adi || op.service_name || op.aciklama || '';
        const dateStr = op.date || op.created_at;
        const personnelName = op.personel?.ad_soyad || op.personnel_name || '';
        
        return serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dateStr && format(new Date(dateStr), 'dd MMMM yyyy', { locale: tr })
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
          personnelName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : operationsWithPhotos;

  const viewPhoto = (operation: CustomerOperation, url: string) => {
    setSelectedOperation(operation);
    setSelectedPhoto(url);
    setIsViewingPhoto(true);
  };

  if (!customerId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="İşlem adı, personel veya tarih ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {filteredOperations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-xs text-purple-600">
                    {operation.personel?.ad_soyad || operation.personnel_name || 'Belirtilmemiş'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {operation.photos?.map((photo: string, index: number) => (
                    <div 
                      key={index} 
                      className="relative aspect-square cursor-pointer overflow-hidden rounded-md"
                      onClick={() => viewPhoto(operation, photo)}
                    >
                      <img 
                        src={photo} 
                        alt={`İşlem fotoğrafı ${index + 1}`}
                        className="object-cover w-full h-full hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">Henüz Fotoğraf Yok</h3>
          <p className="text-gray-500">
            Bu müşteriye ait işlem fotoğrafı bulunmamaktadır.
          </p>
        </div>
      )}

      <Dialog open={isViewingPhoto} onOpenChange={setIsViewingPhoto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fotoğraf Detayları</DialogTitle>
            <DialogDescription>
              İşlem fotoğrafını ve detaylarını görüntüleyin
            </DialogDescription>
          </DialogHeader>
          
          {selectedOperation && selectedPhoto && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedPhoto}
                  alt="İşlem fotoğrafı"
                  className="w-full rounded-md"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {(selectedOperation.date || selectedOperation.created_at) && 
                      format(new Date(selectedOperation.date || selectedOperation.created_at), 'dd MMMM yyyy', { locale: tr })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {selectedOperation.islem?.islem_adi || selectedOperation.service_name || selectedOperation.aciklama}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedOperation.personel?.ad_soyad || selectedOperation.personnel_name || 'Belirtilmemiş'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {formatCurrency(selectedOperation.amount || selectedOperation.tutar || 0)}
                  </span>
                </div>
                
                {(selectedOperation.points || selectedOperation.puan) > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-xs text-center font-bold text-purple-600">★</span>
                    <span className="text-sm">
                      {selectedOperation.points || selectedOperation.puan} puan
                    </span>
                  </div>
                )}
                
                {(selectedOperation.notes || selectedOperation.notlar) && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Not:</p>
                    <p className="text-sm">{selectedOperation.notes || selectedOperation.notlar}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              onClick={() => setIsViewingPhoto(false)}
            >
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
