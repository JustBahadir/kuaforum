
import { useState } from "react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, User, Calendar, Phone, Mail, Home, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelHistoryTable } from "./PersonnelHistoryTable";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import { PersonnelOperationsTable } from "./PersonnelOperationsTable";
import { format } from "date-fns";

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
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} kopyalandı`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belirtilmemiş";
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch {
      return "Geçersiz tarih";
    }
  };

  const handleTabSwipe = (direction: 'left' | 'right') => {
    const tabs = ["details", "operations", "performance"];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const touchStartX = React.useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleTabSwipe('left');
      } else {
        handleTabSwipe('right');
      }
    }
    
    touchStartX.current = null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personel Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center mb-4">
          <Avatar className="h-24 w-24 mb-3">
            {personel.avatar_url ? (
              <AvatarImage src={personel.avatar_url} alt={personel.ad_soyad} />
            ) : (
              <AvatarFallback className="text-lg bg-purple-100 text-purple-800">
                {personel.ad_soyad
                  .split(' ')
                  .map((name: string) => name[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-xl font-bold">{personel.ad_soyad}</h2>
          <div className="badge bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs mt-1">
            {personel.unvan || "Personel"}
          </div>
        </div>
        
        <Tabs 
          defaultValue="details" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="flex justify-center mb-4">
            <TabsList className="grid grid-cols-3 min-w-[350px]">
              <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="performance">Performans</TabsTrigger>
            </TabsList>
          </div>
          
          <div 
            className="tab-content"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-4 text-base">
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <User size={18} className="text-purple-600" /> 
                    Ad Soyad:
                  </div>
                  <div className="col-span-2">{personel.ad_soyad}</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <Calendar size={18} className="text-purple-600" />
                    Doğum Tarihi:
                  </div>
                  <div className="col-span-2">{formatDate(personel.birth_date) || "Belirtilmemiş"}</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <Phone size={18} className="text-purple-600" />
                    Telefon:
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="mr-2">{personel.telefon || "Belirtilmemiş"}</span>
                    {personel.telefon && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(personel.telefon, "Telefon numarası")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <Mail size={18} className="text-purple-600" />
                    E-posta:
                  </div>
                  <div className="col-span-2">
                    <span className="mr-2">{personel.eposta || "Belirtilmemiş"}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <Home size={18} className="text-purple-600" />
                    Adres:
                  </div>
                  <div className="col-span-2">{personel.adres || "Belirtilmemiş"}</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <CreditCard size={18} className="text-purple-600" />
                    Maaş:
                  </div>
                  <div className="col-span-2">
                    {personel.maas ? 
                      new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(personel.maas || 0) 
                      : "₺0,00"}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                  <div className="font-medium flex items-center gap-2">
                    <CreditCard size={18} className="text-purple-600" />
                    IBAN:
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="mr-2">
                      {personel.iban ? profilServisi.formatIBAN(personel.iban) : "Belirtilmemiş"}
                    </span>
                    {personel.iban && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(personel.iban, "IBAN")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setEditDialogOpen(true)}>
                  Düzenle
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="p-1">
              <PersonnelOperationsTable personnelId={personel.id} />
            </TabsContent>
            
            <TabsContent value="performance">
              <PersonnelPerformance personnelId={personel.id} />
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
