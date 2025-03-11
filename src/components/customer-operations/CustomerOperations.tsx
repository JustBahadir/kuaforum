
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Trash } from "lucide-react";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CustomerOperationsProps {
  customerId: string;
  allowAddingPhotos?: boolean;
  maxPhotos?: number;
}

export function CustomerOperations({ 
  customerId, 
  allowAddingPhotos = true,
  maxPhotos = 4
}: CustomerOperationsProps) {
  const [selectedOperation, setSelectedOperation] = useState<any | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [operationNotes, setOperationNotes] = useState("");
  
  const { 
    data: operations = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['customer-operations', customerId],
    queryFn: () => customerOperationsService.getCustomerOperations(customerId),
    enabled: !!customerId
  });
  
  const handleAddPhotoClick = (operation: any) => {
    setSelectedOperation(operation);
    setIsPhotoDialogOpen(true);
  };
  
  const handleEditNotesClick = (operation: any) => {
    setSelectedOperation(operation);
    setOperationNotes(operation.notes || "");
    setNotesDialogOpen(true);
  };
  
  const handlePhotoUpload = async (url: string) => {
    if (!selectedOperation) return;
    
    // Check if adding this photo would exceed maxPhotos
    const currentPhotos = selectedOperation.photos || [];
    if (currentPhotos.length >= maxPhotos) {
      toast.error(`En fazla ${maxPhotos} fotoğraf eklenebilir. Önce bazı fotoğrafları silin.`);
      return;
    }
    
    try {
      // Add the new photo to the list
      const updatedPhotos = [...currentPhotos, url];
      
      // Update in the database
      const success = await customerOperationsService.updateOperationPhotos(
        selectedOperation.id, 
        updatedPhotos
      );
      
      if (success) {
        toast.success("Fotoğraf başarıyla eklendi");
        refetch();
      } else {
        toast.error("Fotoğraf eklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu");
    }
  };
  
  const handleDeletePhoto = async (operation: any, photoUrl: string) => {
    try {
      // Filter out the photo to delete
      const updatedPhotos = (operation.photos || []).filter(
        (url: string) => url !== photoUrl
      );
      
      // Update in the database
      const success = await customerOperationsService.updateOperationPhotos(
        operation.id,
        updatedPhotos
      );
      
      if (success) {
        toast.success("Fotoğraf başarıyla silindi");
        refetch();
      } else {
        toast.error("Fotoğraf silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Fotoğraf silinirken bir hata oluştu");
    }
  };
  
  const handleSaveNotes = async () => {
    if (!selectedOperation) return;
    
    try {
      const success = await customerOperationsService.updateOperationNotes(
        selectedOperation.id,
        operationNotes
      );
      
      if (success) {
        toast.success("Notlar başarıyla güncellendi");
        setNotesDialogOpen(false);
        refetch();
      } else {
        toast.error("Notlar güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Notlar güncellenirken bir hata oluştu");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (operations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Bu müşteri için henüz işlem kaydı bulunmamaktadır.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {operations.map((operation: any) => (
        <Card key={operation.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{operation.service_name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {new Date(operation.date).toLocaleDateString('tr-TR')} - {operation.personnel_name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{operation.amount.toFixed(2)} TL</p>
                <p className="text-sm text-gray-500">{operation.points} Puan</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display operation notes */}
            {operation.notes && (
              <div className="bg-gray-50 p-3 rounded-md">
                <Label className="text-xs text-gray-500 mb-1 block">Notlar</Label>
                <p className="text-sm whitespace-pre-wrap">{operation.notes}</p>
              </div>
            )}
            
            {/* Display operation photos */}
            {operation.photos && operation.photos.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Fotoğraflar</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {operation.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`İşlem fotoğrafı ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        onClick={() => window.open(photo, '_blank')}
                      />
                      {allowAddingPhotos && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeletePhoto(operation, photo)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditNotesClick(operation)}
              >
                {operation.notes ? 'Notları Düzenle' : 'Not Ekle'}
              </Button>
              
              {allowAddingPhotos && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddPhotoClick(operation)}
                  className="gap-1"
                  disabled={(operation.photos || []).length >= maxPhotos}
                >
                  <Camera className="h-4 w-4" />
                  Fotoğraf Ekle
                  {(operation.photos || []).length > 0 && ` (${(operation.photos || []).length}/${maxPhotos})`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Photo upload dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafı Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Bu işlem için bir fotoğraf yükleyin. En fazla {maxPhotos} fotoğraf eklenebilir.
              {selectedOperation && selectedOperation.photos?.length > 0 && 
                ` (${selectedOperation.photos.length}/${maxPhotos})`}
            </p>
            
            <FileUpload
              onUploadComplete={handlePhotoUpload}
              label="Fotoğraf Yükle"
              bucketName="photos"
              folderPath={`customer-operations/${customerId}`}
              maxFileSize={10 * 1024 * 1024} // 10MB limit
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Notes edit dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Notları</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={operationNotes}
              onChange={(e) => setOperationNotes(e.target.value)}
              placeholder="Bu işlemle ilgili notlar..."
              className="min-h-[150px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveNotes}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
