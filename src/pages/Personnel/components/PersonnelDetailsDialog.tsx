
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
import { personelServisi, profilServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Personel } from "@/lib/supabase/types";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: personel, isLoading, refetch } = useQuery({
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

  const handleEditComplete = () => {
    refetch();
  };

  const handleShowImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };
  
  const handleCloseImagePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Personel Detayları</DialogTitle>
            <DialogDescription>
              {personel?.ad_soyad || "Personel bilgileri yükleniyor..."}
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4" />
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
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {personel.avatar_url && (
                        <Avatar 
                          className="h-16 w-16 cursor-pointer" 
                          onClick={() => personel.avatar_url && handleShowImagePreview(personel.avatar_url)}
                        >
                          <AvatarImage src={personel.avatar_url} alt={personel.ad_soyad} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                            {personel.ad_soyad.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditDialogOpen(true)}
                    >
                      Düzenle
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Ad Soyad</h3>
                      <p>{personel.ad_soyad}</p>
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
                      <p>{personel.iban ? profilServisi.formatIBAN(personel.iban) : "Tanımlanmamış"}</p>
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

      <PersonnelEditDialog 
        personelId={personelId} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onEditComplete={handleEditComplete}
      />

      {/* Image Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={handleCloseImagePreview}>
          <DialogContent className="sm:max-w-md flex items-center justify-center">
            <div className="relative">
              <img 
                src={previewImage} 
                alt="Personel fotoğrafı" 
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
