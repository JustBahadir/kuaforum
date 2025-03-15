
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { PersonnelOperationsTable } from "./PersonnelOperationsTable";
import { personelServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Personel } from "@/lib/supabase/types";

interface PersonnelDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number;
}

export function PersonnelDetailsDialog({
  open,
  onOpenChange,
  personelId,
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("bilgiler");

  const { data: personel, isLoading } = useQuery({
    queryKey: ['personel', personelId],
    queryFn: () => personelServisi.getirById(personelId),
    enabled: !!personelId && open,
  });

  useEffect(() => {
    if (open) {
      // Reset to default tab when dialog opens
      setActiveTab("bilgiler");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Personel Detayları</DialogTitle>
          <DialogDescription>
            {personel?.ad_soyad || "Personel bilgileri yükleniyor..."}
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4">
              X
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bilgiler">Bilgiler</TabsTrigger>
            <TabsTrigger value="islemler">İşlemler</TabsTrigger>
            <TabsTrigger value="performans">Performans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bilgiler">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Personel bilgileri yükleniyor...
              </div>
            ) : personel ? (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Ad Soyad</h3>
                    <p>{personel.ad_soyad}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Personel No</h3>
                    <p>{personel.personel_no}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Telefon</h3>
                    <p>{personel.telefon}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">E-posta</h3>
                    <p>{personel.eposta}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Adres</h3>
                  <p>{personel.adres}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Maaş</h3>
                    <p>{personel.maas} TL</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Çalışma Sistemi</h3>
                    <p>{personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Prim Yüzdesi</h3>
                    <p>%{personel.prim_yuzdesi}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">IBAN</h3>
                    <p>{personel.iban || "Tanımlanmamış"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Personel bilgileri burada görüntülenecektir.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="islemler" className="mt-4">
            <PersonnelOperationsTable personnelId={personelId} />
          </TabsContent>
          
          <TabsContent value="performans" className="mt-4">
            <PersonnelPerformance personnelId={personelId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
