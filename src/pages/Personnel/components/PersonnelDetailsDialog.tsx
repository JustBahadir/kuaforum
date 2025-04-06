
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Personel } from "@/lib/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { PersonnelHistoryTable } from "./PersonnelHistoryTable";
import { AddOperationForm } from "@/components/operations/AddOperationForm";

interface PersonnelDetailsDialogProps {
  personel: Personel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDetailsDialog({ personel, open, onOpenChange }: PersonnelDetailsDialogProps) {
  const [addOperationDialogOpen, setAddOperationDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Get personnel details
  const { data: personnelDetails, isLoading } = useQuery({
    queryKey: ['personel', personel.id],
    queryFn: () => personelServisi.getirById(personel.id),
    enabled: open,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span>{personel.ad_soyad}</span>
              <Button size="sm" variant="outline" className="ml-2">
                <FileEdit className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList>
              <TabsTrigger value="details">Personel Bilgileri</TabsTrigger>
              <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                  <p>{personel.telefon}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">E-posta</h3>
                  <p>{personel.eposta}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personel No</h3>
                  <p>{personel.personel_no}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Maaş</h3>
                  <p>{personel.maas} ₺</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Çalışma Sistemi</h3>
                  <p>{personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Prim Yüzdesi</h3>
                  <p>%{personel.prim_yuzdesi}</p>
                </div>
                
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Adres</h3>
                  <p>{personel.adres}</p>
                </div>
                
                {personel.iban && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">IBAN</h3>
                    <p className="font-mono">{personel.iban}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={() => setAddOperationDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Yeni İşlem Ekle
                </Button>
              </div>
              
              <PersonnelHistoryTable personnelId={personel.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AddOperationForm
        personnelId={personel.id}
        isOpen={addOperationDialogOpen}
        onClose={() => setAddOperationDialogOpen(false)}
      />
    </>
  );
}
