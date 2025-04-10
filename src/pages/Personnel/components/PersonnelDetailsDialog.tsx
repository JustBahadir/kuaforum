
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { PersonnelForm } from "./PersonnelForm";
import { PersonnelOperationsTable } from "./PersonnelOperationsTable";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import { Button } from "@/components/ui/button";

interface PersonnelDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
}

export function PersonnelDetailsDialog({
  isOpen,
  onOpenChange,
  personnel
}: PersonnelDetailsDialogProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  if (!personnel) return null;

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personel Bilgileri</DialogTitle>
            <DialogDescription>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium text-foreground">{personnel.ad_soyad}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditClick}
                >
                  Düzenle
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
                <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
                <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
                <TabsTrigger value="performance">Performans</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal-info">
                <PersonnelForm personnel={personnel} readOnly />
              </TabsContent>
              
              <TabsContent value="work-info">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Çalışma Bilgileri</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Personel No</span>
                          <span>{personnel.personel_no}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Çalışma Sistemi</span>
                          <span>{personnel.calisma_sistemi}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Maaş</span>
                          <span>
                            {new Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: "TRY",
                            }).format(personnel.maas || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Prim Yüzdesi</span>
                          <span>%{personnel.prim_yuzdesi}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">İletişim Bilgileri</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Telefon</span>
                          <span>{personnel.telefon}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">E-posta</span>
                          <span>{personnel.eposta}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Adres</span>
                          <span className="text-right">{personnel.adres}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">IBAN</span>
                          <span>{personnel.iban}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <PersonnelOperationsTable personnelId={personnel.id} />
              </TabsContent>
              
              <TabsContent value="performance">
                <PersonnelPerformance personnelId={personnel.id} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      {isEditModalOpen && (
        <PersonnelEditDialog 
          isOpen={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen}
          personnel={personnel}
        />
      )}
    </>
  );
}
