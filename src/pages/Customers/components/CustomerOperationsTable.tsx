
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerOperation, customerOperationsService } from "@/lib/supabase";
import { Camera, Eye } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

interface CustomerOperationsTableProps {
  operations: CustomerOperation[];
  isLoading: boolean;
}

export function CustomerOperationsTable({ operations, isLoading }: CustomerOperationsTableProps) {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [uploadingForId, setUploadingForId] = useState<number | null>(null);
  const [viewingPhotosForId, setViewingPhotosForId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => 
      customerOperationsService.updateOperationNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("Not başarıyla güncellendi");
      setEditingNoteId(null);
    },
    onError: (error) => {
      toast.error("Not güncellenirken bir hata oluştu");
      console.error("Note update error:", error);
    }
  });
  
  const addPhotoMutation = useMutation({
    mutationFn: ({ id, photoUrl }: { id: number; photoUrl: string }) => 
      customerOperationsService.addOperationPhoto(id, photoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("Fotoğraf başarıyla eklendi");
      setUploadingForId(null);
    },
    onError: (error) => {
      toast.error("Fotoğraf eklenirken bir hata oluştu");
      console.error("Photo upload error:", error);
    }
  });
  
  const handleEditNote = (operation: CustomerOperation) => {
    setEditingNoteId(operation.id);
    setNoteText(operation.notes || "");
  };
  
  const handleSaveNote = (id: number) => {
    updateNotesMutation.mutate({ id, notes: noteText });
  };
  
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteText("");
  };
  
  const handleAddPhoto = (id: number) => {
    setUploadingForId(id);
  };
  
  const handleViewPhotos = (operation: CustomerOperation) => {
    if (operation.photos && operation.photos.length > 0) {
      setViewingPhotosForId(operation.id);
    } else {
      toast.info("Bu işlem için fotoğraf bulunmamaktadır");
    }
  };
  
  const handlePhotoUploaded = (url: string) => {
    if (uploadingForId) {
      addPhotoMutation.mutate({ id: uploadingForId, photoUrl: url });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("tr-TR");
    } catch (e) {
      return "Geçersiz tarih";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Bu müşteri için henüz işlem kaydı bulunmamaktadır.
      </div>
    );
  }

  const getOperation = (id: number) => {
    return operations.find(op => op.id === id);
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hizmet</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notlar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operations.map((operation) => (
            <tr key={operation.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(operation.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.service_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.personnel_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(operation.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.points}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                {editingNoteId === operation.id ? (
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Müşteri hakkında notlar..."
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{operation.notes || "-"}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingNoteId === operation.id ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSaveNote(operation.id)}
                      disabled={updateNotesMutation.isPending}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      İptal
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNote(operation)}
                    >
                      Notu Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddPhoto(operation.id)}
                      title="Fotoğraf Ekle"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    {operation.photos && operation.photos.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPhotos(operation)}
                        title="Fotoğrafları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="ml-1">{operation.photos.length}</span>
                      </Button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Photo Upload Dialog */}
      <Dialog open={uploadingForId !== null} onOpenChange={(open) => !open && setUploadingForId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fotoğraf Ekle</DialogTitle>
          </DialogHeader>
          
          <FileUpload 
            onUploadComplete={handlePhotoUploaded}
            label="İşlem Fotoğrafı Yükle"
            bucketName="operation_photos"
            folderPath="customer_operations"
            acceptedFileTypes="image/*"
            maxFileSize={5 * 1024 * 1024}
          />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadingForId(null)}
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Photo Viewing Dialog */}
      <Dialog open={viewingPhotosForId !== null} onOpenChange={(open) => !open && setViewingPhotosForId(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {viewingPhotosForId && getOperation(viewingPhotosForId)?.photos?.map((photo, index) => (
              <div key={index} className="rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={photo} 
                  alt={`İşlem fotoğrafı ${index + 1}`}
                  className="w-full h-[200px] object-cover"
                />
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setViewingPhotosForId(null)}
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
