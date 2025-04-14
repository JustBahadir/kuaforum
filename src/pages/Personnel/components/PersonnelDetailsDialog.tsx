
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Phone, Mail, Copy, MapPin, CreditCard, Calendar } from "lucide-react";
import { personelServisi, personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
import { PersonnelEditDialog } from "./PersonnelEditDialog";

interface PersonnelDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any | null;
  onEdit?: (personnel: any) => void;
}

export function PersonnelDetailsDialog({
  isOpen,
  onOpenChange,
  personnel,
  onEdit,
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("kisisel");
  const [operations, setOperations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch personnel operations when dialog opens or personnel changes
  useEffect(() => {
    if (personnel?.id && isOpen) {
      setIsLoading(true);
      personelIslemleriServisi
        .personelIslemleriGetir(personnel.id)
        .then((data) => {
          setOperations(data || []);
        })
        .catch(console.error)
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [personnel, isOpen]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} kopyalandı`);
  };

  // Format birth date
  const formatBirthDate = (birthDate: string | null) => {
    if (!birthDate) return "Belirtilmemiş";
    return new Date(birthDate).toLocaleDateString("tr-TR");
  };

  if (!personnel) return null;

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />
                  <AvatarFallback>{getInitials(personnel.ad_soyad)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl">{personnel.ad_soyad}</DialogTitle>
                  <DialogDescription>
                    {personnel.calisma_sistemi === "prim_komisyon" 
                      ? `Yüzdelik Çalışan (%${personnel.prim_yuzdesi})` 
                      : personnel.calisma_sistemi === "aylik_maas" 
                        ? "Aylık Maaşlı" 
                        : personnel.calisma_sistemi === "haftalik_maas" 
                          ? "Haftalık Maaşlı"
                          : "Günlük Maaşlı"}
                  </DialogDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex gap-2"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4" />
                <span>Düzenle</span>
              </Button>
            </div>
          </DialogHeader>

          <Tabs 
            defaultValue="kisisel" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mt-2"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="kisisel">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="calisma">Çalışma Bilgileri</TabsTrigger>
              <TabsTrigger value="performans">Performans</TabsTrigger>
              <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
            </TabsList>

            <TabsContent value="kisisel" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Ad Soyad</div>
                  <div>{personnel.ad_soyad}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Doğum Tarihi</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatBirthDate(personnel.birth_date)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Telefon</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{personnel.telefon || "Belirtilmemiş"}</span>
                    {personnel.telefon && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(personnel.telefon, "Telefon")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">E-posta</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{personnel.eposta || "Belirtilmemiş"}</span>
                  </div>
                </div>
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground">Adres</div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{personnel.adres || "Adres belirtilmemiş"}</span>
                  </div>
                </div>
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground">IBAN</div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{personnel.iban || "IBAN belirtilmemiş"}</span>
                    {personnel.iban && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(personnel.iban, "IBAN")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calisma" className="space-y-4 mt-4">
              <WorkInfoTab personnel={personnel} />
            </TabsContent>
            
            <TabsContent value="performans" className="space-y-4 mt-4">
              <PerformanceTab personnel={personnel} />
            </TabsContent>
            
            <TabsContent value="islemler" className="mt-4">
              <OperationsHistoryTab personnel={personnel} operations={operations} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {personnel && (
        <PersonnelEditDialog 
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          personnel={personnel}
        />
      )}
    </>
  );
}
