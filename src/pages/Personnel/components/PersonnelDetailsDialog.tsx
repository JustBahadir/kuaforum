
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
import { PersonnelDeleteDialog } from "./PersonnelDeleteDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (!personnel) return null;

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };
  
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />
                <AvatarFallback>{getInitials(personnel.ad_soyad)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>{personnel.ad_soyad}</DialogTitle>
                <DialogDescription className="mt-1">
                  {personnel.calisma_sistemi === "aylik_maas" ? "Maaşlı Çalışan" : "Yüzdelik Çalışan"}
                </DialogDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEditClick}
              className="mt-0 flex items-center gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Düzenle
            </Button>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
                <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
                <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal-info">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">İletişim Bilgileri</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Ad Soyad</span>
                          <span>{personnel.ad_soyad}</span>
                        </div>
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
              
              <TabsContent value="work-info">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Çalışma Bilgileri</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Çalışma Sistemi</span>
                          <span>
                            {personnel.calisma_sistemi === "aylik_maas" ? "Aylık Maaş" : 
                             personnel.calisma_sistemi === "haftalik_maas" ? "Haftalık Maaş" : 
                             personnel.calisma_sistemi === "gunluk_maas" ? "Günlük Maaş" :
                             personnel.calisma_sistemi === "prim_komisyon" ? "Prim/Komisyon" : 
                             personnel.calisma_sistemi}
                          </span>
                        </div>
                        {["aylik_maas", "haftalik_maas", "gunluk_maas"].includes(personnel.calisma_sistemi) && (
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Maaş Bilgisi</span>
                            <span>
                              {new Intl.NumberFormat("tr-TR", {
                                style: "currency",
                                currency: "TRY",
                              }).format(personnel.maas || 0)}
                            </span>
                          </div>
                        )}
                        {personnel.calisma_sistemi === "prim_komisyon" && (
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Prim Oranı</span>
                            <span>%{personnel.prim_yuzdesi}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <PersonnelOperationsTable personnelId={personnel.id} />
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
      
      <PersonnelDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        personnelId={personnel?.id}
        personnelName={personnel?.ad_soyad}
      />
    </>
  );
}
