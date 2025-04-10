
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
import { Copy, User, Calendar, Phone, Mail, Home, CreditCard, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { profilServisi, personelServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelHistoryTable } from "./PersonnelHistoryTable";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { formatCurrency } from "@/lib/utils";
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
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} kopyalandı`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belirtilmemiş";
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return "Geçersiz tarih";
    }
  };

  const handleEditComplete = () => {
    setEditDialogOpen(false);
    // You might want to refresh personnel data here
  };

  // Define a function to get working type label with color
  const getWorkingTypeLabel = (type?: string) => {
    if (!type) return { label: "Belirtilmemiş", color: "bg-gray-100 text-gray-800" };
    
    switch (type) {
      case 'aylik_maas':
        return { label: "Maaşlı", color: "bg-blue-100 text-blue-800" };
      case 'prim_komisyon':
        return { label: "Primli/Komisyonlu", color: "bg-green-100 text-green-800" };
      case 'gunluk_yevmiye':
        return { label: "Günlük Yevmiyeli", color: "bg-orange-100 text-orange-800" };
      case 'haftalik_yevmiye':
        return { label: "Haftalık Yevmiyeli", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { label: type, color: "bg-gray-100 text-gray-800" };
    }
  };
  
  const workingType = getWorkingTypeLabel(personel.calisma_sistemi);

  return (
    <>
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
            <div className={`${workingType.color} px-2 py-1 rounded-full text-xs mt-1`}>
              {workingType.label}
            </div>
          </div>
          
          <Tabs 
            defaultValue="details" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="flex justify-center mb-4 overflow-x-auto">
              <TabsList className="grid grid-cols-4 min-w-[400px]">
                <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
                <TabsTrigger value="performance">Performans</TabsTrigger>
                <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="tab-content">
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
              
              <TabsContent value="work-info">
                <div className="grid gap-4 text-base">
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                    <div className="font-medium flex items-center gap-2">
                      <Briefcase size={18} className="text-purple-600" />
                      Çalışma Şekli:
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-md text-sm ${workingType.color}`}>
                        {workingType.label}
                      </span>
                    </div>
                  </div>
                  
                  {personel.calisma_sistemi === 'aylik_maas' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                      <div className="font-medium flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600" />
                        Aylık Maaş:
                      </div>
                      <div className="col-span-2">
                        {formatCurrency(personel.maas || 0)}
                      </div>
                    </div>
                  )}
                  
                  {personel.calisma_sistemi === 'gunluk_yevmiye' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                      <div className="font-medium flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600" />
                        Günlük Yevmiye:
                      </div>
                      <div className="col-span-2">
                        {formatCurrency(personel.gunluk_ucret || 0)}
                      </div>
                    </div>
                  )}
                  
                  {personel.calisma_sistemi === 'haftalik_yevmiye' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                      <div className="font-medium flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600" />
                        Haftalık Yevmiye:
                      </div>
                      <div className="col-span-2">
                        {formatCurrency(personel.haftalik_ucret || 0)}
                      </div>
                    </div>
                  )}
                  
                  {personel.calisma_sistemi === 'prim_komisyon' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                      <div className="font-medium flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600" />
                        Komisyon Oranı:
                      </div>
                      <div className="col-span-2">
                        %{personel.prim_yuzdesi || 0}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center border-b pb-2">
                    <div className="font-medium flex items-center gap-2">
                      <Calendar size={18} className="text-purple-600" />
                      İşe Başlama Tarihi:
                    </div>
                    <div className="col-span-2">
                      {formatDate(personel.baslama_tarihi) || "Belirtilmemiş"}
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
                
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setEditDialogOpen(true)}>
                    Düzenle
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      {personel && (
        <PersonnelEditDialog
          personelId={personel.id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEditComplete={handleEditComplete}
        />
      )}
    </>
  );
}
