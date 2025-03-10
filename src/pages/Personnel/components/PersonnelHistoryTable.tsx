
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { personelIslemleriServisi } from "@/lib/supabase";
import { PersonelIslemi } from "@/lib/supabase/types";
import { OperationPhotoUpload } from "@/components/operations/OperationPhotoUpload";

interface PersonnelHistoryTableProps {
  personelId: number;
}

export function PersonnelHistoryTable({ personelId }: PersonnelHistoryTableProps) {
  const [operations, setOperations] = useState<PersonelIslemi[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<PersonelIslemi | null>(null);
  const [photoViewOpen, setPhotoViewOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const data = await personelIslemleriServisi.personelIslemleriGetir(personelId);
      setOperations(data);
    } catch (error) {
      console.error("Error fetching personnel operations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personelId) {
      fetchOperations();
    }
  }, [personelId]);

  const handleOpenPhotoUpload = (operation: PersonelIslemi) => {
    setCurrentOperation(operation);
    setPhotoUploadOpen(true);
  };

  const handleViewPhotos = (operation: PersonelIslemi) => {
    if (operation.photos && operation.photos.length > 0) {
      setCurrentPhotos(operation.photos);
      setPhotoViewOpen(true);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: tr });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">İşlem Geçmişi</h3>
      
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">İşlemler yükleniyor...</p>
        </div>
      ) : operations.length === 0 ? (
        <div className="py-8 text-center border rounded-md">
          <p className="text-gray-500">Bu personele ait işlem bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">Prim (%)</TableHead>
                <TableHead className="text-right">Ödenen</TableHead>
                <TableHead className="text-right">Puan</TableHead>
                <TableHead className="text-center">Fotoğraflar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell>{formatDate(operation.created_at!)}</TableCell>
                  <TableCell className="max-w-xs truncate">{operation.aciklama}</TableCell>
                  <TableCell className="text-right">{operation.tutar} ₺</TableCell>
                  <TableCell className="text-right">%{operation.prim_yuzdesi}</TableCell>
                  <TableCell className="text-right">{operation.odenen} ₺</TableCell>
                  <TableCell className="text-right">{operation.puan}</TableCell>
                  <TableCell className="text-center">
                    {operation.photos && operation.photos.length > 0 ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewPhotos(operation)}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        {operation.photos.length}
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenPhotoUpload(operation)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Photo Upload Dialog */}
      <Dialog open={photoUploadOpen} onOpenChange={setPhotoUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafı Ekle</DialogTitle>
          </DialogHeader>
          {currentOperation && (
            <OperationPhotoUpload
              personelId={personelId}
              operationId={currentOperation.id}
              onSuccess={() => {
                setPhotoUploadOpen(false);
                fetchOperations();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photo View Dialog */}
      <Dialog open={photoViewOpen} onOpenChange={setPhotoViewOpen}>
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
    </div>
  );
}
