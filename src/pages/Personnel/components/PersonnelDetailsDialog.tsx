
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, User } from "lucide-react";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelHistoryTable } from "./PersonnelHistoryTable";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { PersonnelEditDialog } from "./PersonnelEditDialog";

interface PersonnelDetailsDialogProps {
  personel: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDetailsDialog({
  personel,
  open,
  onOpenChange,
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Copy IBAN to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("IBAN kopyalandı");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Personel Detayları</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24">
                {personel.avatar_url ? (
                  <AvatarImage src={personel.avatar_url} alt={personel.ad_soyad} />
                ) : (
                  <AvatarFallback className="text-lg">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="text-xl font-bold">{personel.ad_soyad}</h2>
              <div className="badge bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {personel.unvan}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-3 items-center">
                <span className="font-medium">Ad Soyad:</span>
                <span className="col-span-2">{personel.ad_soyad}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="font-medium">Telefon:</span>
                <span className="col-span-2">{personel.telefon || "Belirtilmemiş"}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="font-medium">E-posta:</span>
                <span className="col-span-2">{personel.eposta || "Belirtilmemiş"}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="font-medium">Adres:</span>
                <span className="col-span-2">{personel.adres || "Belirtilmemiş"}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="font-medium">Maaş:</span>
                <span className="col-span-2">
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(personel.maas || 0)}
                </span>
              </div>
              {personel.iban && (
                <div className="grid grid-cols-3 items-center">
                  <span className="font-medium">IBAN:</span>
                  <div className="col-span-2 flex items-center">
                    <span className="mr-2">{profilServisi.formatIBAN(personel.iban)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(personel.iban)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setEditDialogOpen(true)}>
                Düzenle
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="operations">
            <PersonnelHistoryTable personnelId={personel.id} />
          </TabsContent>
          
          <TabsContent value="performance">
            <PersonnelPerformance personnelId={personel.id} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>

      <PersonnelEditDialog
        personelId={personel.id}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Dialog>
  );
}
