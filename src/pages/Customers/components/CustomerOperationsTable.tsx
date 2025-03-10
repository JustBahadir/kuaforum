
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import OperationPhotoUpload from "@/components/operations/OperationPhotoUpload";

interface CustomerOperationsTableProps {
  customerId?: number;
}

export const CustomerOperationsTable = ({ customerId }: CustomerOperationsTableProps) => {
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);
  const [viewPhotoDialogOpen, setViewPhotoDialogOpen] = useState(false);
  const [uploadPhotoDialogOpen, setUploadPhotoDialogOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      return await personelIslemleriServisi.musteriIslemleriGetir(customerId);
    },
    enabled: !!customerId
  });

  const handleViewPhotos = (photos: string[] = []) => {
    if (photos && photos.length > 0) {
      setCurrentPhotos(photos);
      setViewPhotoDialogOpen(true);
    }
  };

  const handleOpenUploadDialog = (operationId: number, photos: string[] = []) => {
    setSelectedOperationId(operationId);
    setCurrentPhotos(photos);
    setUploadPhotoDialogOpen(true);
  };

  const handlePhotosUpdated = async (photos: string[]) => {
    if (!selectedOperationId) return;
    
    try {
      await personelIslemleriServisi.guncelle(selectedOperationId, { photos });
      toast.success("Fotoğraflar başarıyla güncellendi");
      refetch();
      setUploadPhotoDialogOpen(false);
    } catch (error) {
      console.error("Error updating photos:", error);
      toast.error("Fotoğraflar güncellenirken bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!operations.length) {
    return (
      <div className="text-center p-4 border rounded-md">
        <p className="text-muted-foreground">Bu müşteriye ait işlem bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fotoğraflar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operations.map((operation) => (
              <tr key={operation.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(operation.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.personel?.ad_soyad}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.aciklama}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.tutar} TL
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.puan}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex space-x-2">
                    {operation.photos && operation.photos.length > 0 ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewPhotos(operation.photos)}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        {operation.photos.length}
                      </Button>
                    ) : (
                      <span className="text-gray-400 mr-2">-</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenUploadDialog(operation.id, operation.photos || [])}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Photos Dialog */}
      <Dialog open={viewPhotoDialogOpen} onOpenChange={setViewPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Operation photo ${index + 1}`} 
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Photos Dialog */}
      <Dialog open={uploadPhotoDialogOpen} onOpenChange={setUploadPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fotoğraf Ekle/Düzenle</DialogTitle>
          </DialogHeader>
          <OperationPhotoUpload 
            existingPhotos={currentPhotos} 
            onPhotosUpdated={handlePhotosUpdated} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerOperationsTable;
