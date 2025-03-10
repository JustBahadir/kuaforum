
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerOperation, customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "lucide-react";
import { OperationPhotoUpload } from "@/components/operations/OperationPhotoUpload";
import { toast } from "sonner";

interface CustomerOperationsTableProps {
  customerId: string;
  operations: CustomerOperation[];
  onRefresh: () => void;
}

export function CustomerOperationsTable({ 
  customerId, 
  operations, 
  onRefresh 
}: CustomerOperationsTableProps) {
  const [selectedOperation, setSelectedOperation] = useState<CustomerOperation | null>(null);
  const [notes, setNotes] = useState("");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false);
  const [photoViewDialogOpen, setPhotoViewDialogOpen] = useState(false);

  const handleNotesClick = (operation: CustomerOperation) => {
    setSelectedOperation(operation);
    setNotes(operation.notes || "");
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedOperation) return;
    
    try {
      const success = await customerOperationsService.updateOperationNotes(
        selectedOperation.id, 
        notes
      );
      
      if (success) {
        toast.success("Notlar başarıyla güncellendi");
        setNotesDialogOpen(false);
        onRefresh();
      } else {
        toast.error("Notlar güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Notlar kaydedilirken bir hata oluştu");
    }
  };

  const handlePhotoUploadClick = (operation: CustomerOperation) => {
    setSelectedOperation(operation);
    setPhotosDialogOpen(true);
  };

  const handleViewPhotos = (operation: CustomerOperation) => {
    setSelectedOperation(operation);
    setPhotoViewDialogOpen(true);
  };

  const handlePhotosUpdated = async (photos: string[]) => {
    if (!selectedOperation) return;
    
    try {
      const success = await customerOperationsService.updateOperationPhotos(
        selectedOperation.id, 
        photos
      );
      
      if (success) {
        toast.success("Fotoğraflar başarıyla güncellendi");
        onRefresh();
      } else {
        toast.error("Fotoğraflar güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error updating photos:", error);
      toast.error("Fotoğraflar güncellenirken bir hata oluştu");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşlem Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Personel</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Puan</TableHead>
              <TableHead>Notlar</TableHead>
              <TableHead>Fotoğraflar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length > 0 ? (
              operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell>{new Date(operation.date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{operation.service_name}</TableCell>
                  <TableCell>{operation.personnel_name}</TableCell>
                  <TableCell>{operation.amount} ₺</TableCell>
                  <TableCell>{operation.points}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleNotesClick(operation)}
                    >
                      {operation.notes ? operation.notes.substring(0, 15) + "..." : "Not ekle"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {operation.photos && operation.photos.length > 0 ? (
                        <Button 
                          variant="ghost" 
                          onClick={() => handleViewPhotos(operation)}
                          className="flex items-center"
                        >
                          <Image className="h-4 w-4 mr-1" />
                          {operation.photos.length} Fotoğraf
                        </Button>
                      ) : (
                        <span className="text-gray-400">Fotoğraf yok</span>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePhotoUploadClick(operation)}
                      >
                        Ekle
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Bu müşteriye ait işlem kaydı bulunamadı
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Notları</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu işlem için notlarınızı girin..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setNotesDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleSaveNotes}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photosDialogOpen} onOpenChange={setPhotosDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <OperationPhotoUpload
              existingPhotos={selectedOperation.photos || []}
              onPhotosUpdated={async (photos) => {
                await handlePhotosUpdated(photos);
                setPhotosDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photo View Dialog */}
      <Dialog open={photoViewDialogOpen} onOpenChange={setPhotoViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {selectedOperation?.photos?.map((photo, index) => (
              <a href={photo} target="_blank" rel="noopener noreferrer" key={index} className="block">
                <img 
                  src={photo} 
                  alt={`İşlem fotoğrafı ${index + 1}`} 
                  className="rounded-md object-cover w-full h-48"
                />
              </a>
            ))}
          </div>
          {(!selectedOperation?.photos || selectedOperation.photos.length === 0) && (
            <p className="text-center text-gray-500 py-8">Bu işleme ait fotoğraf bulunmamaktadır</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
