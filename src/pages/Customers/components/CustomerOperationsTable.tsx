
import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, FileImage, Image, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerOperationsService, CustomerOperation } from "@/lib/supabase/services/customerOperationsService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerOperationsTableProps {
  customerId: number;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const { 
    operations, 
    isLoading, 
    handleForceRecover, 
    refetch,
    totals 
  } = useCustomerOperations(customerId);

  const [selectedOperation, setSelectedOperation] = useState<CustomerOperation | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      await customerOperationsService.updateOperationNotes(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations', customerId] });
      toast.success("Notlar kaydedildi");
      setNotesDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error saving notes:", error);
      toast.error("Notlar kaydedilemedi");
    }
  });

  const handleSaveNotes = () => {
    if (selectedOperation) {
      updateNotes.mutate({ id: selectedOperation.id, notes });
    }
  };

  const handleOpenNotesDialog = (operation: any) => {
    setSelectedOperation(operation);
    setNotes(operation.notlar || "");
    setNotesDialogOpen(true);
  };

  const handleOpenPhotoDialog = (operation: any) => {
    setSelectedOperation(operation);
    setPhotoDialogOpen(true);
  };

  const handlePhotoUpload = async (url: string) => {
    if (!selectedOperation) return;
    
    try {
      await customerOperationsService.addOperationPhoto(selectedOperation.id, url);
      toast.success("Fotoğraf başarıyla eklendi");
      queryClient.invalidateQueries({ queryKey: ['customerOperations', customerId] });
      setPhotoDialogOpen(false);
    } catch (error) {
      console.error("Error adding photo:", error);
      toast.error("Fotoğraf eklenirken bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        <span className="ml-2">İşlem geçmişi yükleniyor...</span>
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center space-y-4">
        <h3 className="text-lg font-medium">Müşteri İşlem Geçmişi Bulunamadı</h3>
        <p className="text-gray-500">Bu müşteriye ait işlem geçmişi bulunmamaktadır.</p>
        <Button 
          onClick={() => handleForceRecover()}
          className="mt-2 flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          İşlemleri Yenile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">İşlem Geçmişi</h3>
        <Button 
          onClick={() => {
            handleForceRecover();
            toast.info("İşlem geçmişi yenileniyor...");
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCcw size={14} />
          Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Toplam İşlem Tutarı</div>
          <div className="text-xl font-bold mt-1">{formatCurrency(totals.totalAmount)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Toplam Ödenen</div>
          <div className="text-xl font-bold mt-1 text-green-700">{formatCurrency(totals.totalPaid)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Toplam Puan</div>
          <div className="text-xl font-bold mt-1 text-purple-700">{totals.totalPoints}</div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Personel</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Puan</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => (
              <TableRow key={operation.id} className="hover:bg-gray-50">
                <TableCell>
                  {operation.date && format(new Date(operation.date), 'dd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  {(operation.islem?.islem_adi || operation.service_name || operation.aciklama || 'Belirtilmemiş')}
                </TableCell>
                <TableCell>
                  {(operation.personel?.ad_soyad || operation.personnel_name || 'Belirtilmemiş')}
                </TableCell>
                <TableCell>{formatCurrency(operation.amount || operation.tutar || 0)}</TableCell>
                <TableCell>{operation.points || operation.puan || 0}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenNotesDialog(operation)}
                    title="Not ekle"
                  >
                    Not
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPhotoDialog(operation)}
                    title="Fotoğraf ekle"
                    className="text-purple-700"
                  >
                    <Plus size={16} className="mr-1" />
                    Fotoğraf
                  </Button>
                  {operation.photos && operation.photos.length > 0 && (
                    <span className="inline-block bg-gray-100 text-xs rounded-full px-2 py-0.5 ml-2">
                      {operation.photos.length} foto
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Notu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İşlem ile ilgili notlar..."
              className="h-36"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveNotes}
                disabled={updateNotes.isPending}
              >
                {updateNotes.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafı Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <FileUpload 
              onUploadComplete={handlePhotoUpload}
              bucketName="photos"
              folderPath="operations"
              label="Fotoğraf Yükle"
              maxFileSize={10 * 1024 * 1024} // 10MB
            />
            <div className="text-xs text-gray-500 mt-2">
              Maksimum 10MB boyutunda dosya yükleyebilirsiniz.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
