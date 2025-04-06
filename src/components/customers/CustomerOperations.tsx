
import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerOperation } from "@/lib/supabase/services/customerOperationsService";
import { CustomerPhotoGallery } from "@/components/customers/CustomerPhotoGallery";
import { AddOperationForm } from "@/components/operations/AddOperationForm";
import { FileImage, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client"; // Added missing import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CustomerOperationsProps {
  customerId: number;
}

export function CustomerOperations({ customerId }: CustomerOperationsProps) {
  const { 
    operations, 
    isLoading, 
    recoverOperations,
    refetch,
  } = useCustomerOperations(customerId);

  // Compute totals locally since they don't come from the hook
  const totals = {
    totalAmount: operations.reduce((sum, op) => sum + (op.amount || op.tutar || 0), 0),
    totalPaid: operations.reduce((sum, op) => sum + (op.odenen || 0), 0),
    totalPoints: operations.reduce((sum, op) => sum + (op.points || op.puan || 0), 0)
  };

  const [selectedOperation, setSelectedOperation] = useState<CustomerOperation | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [addOperationDialogOpen, setAddOperationDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleOpenNotesDialog = (operation: CustomerOperation) => {
    setSelectedOperation(operation);
    setNotes(operation.notlar || operation.notes || "");
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedOperation) return;
    
    try {
      // Use supabase functions directly
      await supabase.functions.invoke('update-operation-notes', {
        body: { operationId: selectedOperation.id, notes }
      });
      
      toast.success("Notlar kaydedildi");
      setNotesDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Notlar kaydedilemedi");
    }
  };

  // Use recoverOperations instead of handleForceRecover
  const handleForceRecover = () => {
    recoverOperations();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        <span className="ml-2">İşlem geçmişi yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Müşteri İşlemleri</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleForceRecover}
            className="flex items-center gap-1"
          >
            <RefreshCcw size={14} />
            Yenile
          </Button>
          <Button 
            size="sm"
            onClick={() => setAddOperationDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus size={14} />
            Yeni İşlem
          </Button>
        </div>
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

      <Tabs defaultValue="operations">
        <TabsList>
          <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="photos">Fotoğraf Galerisi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations" className="mt-6">
          {operations && operations.length > 0 ? (
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
                        {operation.photos && operation.photos.length > 0 && (
                          <span className="inline-flex items-center bg-gray-100 text-xs rounded-full px-2 py-0.5 ml-2">
                            <FileImage className="h-3 w-3 mr-1" />
                            {operation.photos.length}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">Bu müşteri için henüz işlem kaydı bulunmuyor.</p>
              <Button 
                onClick={() => setAddOperationDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Yeni İşlem Ekle
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="photos" className="mt-6">
          <CustomerPhotoGallery customerId={customerId} />
        </TabsContent>
      </Tabs>
      
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
              <Button onClick={handleSaveNotes}>
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AddOperationForm
        customerId={customerId}
        isOpen={addOperationDialogOpen}
        onClose={() => setAddOperationDialogOpen(false)}
      />
    </div>
  );
}
