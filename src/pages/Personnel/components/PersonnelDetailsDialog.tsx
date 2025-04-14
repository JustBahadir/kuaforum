
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { PersonnelOperationsTable } from "./PersonnelOperationsTable";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { PersonnelDeleteDialog } from "./PersonnelDeleteDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Pencil, Calendar, Phone, Mail, MapPin, CreditCard, User } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { profilServisi } from "@/lib/supabase";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing personnel
  const [workingForm, setWorkingForm] = useState({
    calisma_sistemi: personnel?.calisma_sistemi || "aylik_maas",
    maas: personnel?.maas || 0,
    prim_yuzdesi: personnel?.prim_yuzdesi || 0,
  });
  
  if (!personnel) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} kopyalandı`);
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

  const formatIBAN = (iban: string) => {
    if (!iban) return "Belirtilmemiş";
    return profilServisi.formatIBAN(iban);
  };
  
  const handleSaveChanges = async () => {
    try {
      // Call the personelServisi to update the personnel data
      const updatedPersonnel = await fetch(`/api/personnel/${personnel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workingForm),
      }).then(res => res.json());
      
      toast.success("Çalışma bilgileri güncellendi");
      setIsEditing(false);
      
      // Refresh the personnel data somehow (ideally through the parent component)
      // You might want to call a callback function passed as prop
    } catch (error) {
      toast.error("Güncelleme sırasında bir hata oluştu");
      console.error(error);
    }
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
                <div className="mt-1 text-sm text-muted-foreground">
                  {personnel.calisma_sistemi === "aylik_maas" ? "Maaşlı Çalışan" : 
                   personnel.calisma_sistemi === "haftalik_maas" ? "Maaşlı Çalışan" :
                   personnel.calisma_sistemi === "gunluk_maas" ? "Maaşlı Çalışan" :
                   "Yüzdelik Çalışan"}
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="personal-info">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
                <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal-info">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">İletişim Bilgileri</h3>
                      <div className="space-y-4">
                        {/* Ad Soyad */}
                        <div className="flex items-center border-b pb-3">
                          <User className="h-4 w-4 text-purple-500 mr-3" />
                          <span className="w-28 text-muted-foreground">Ad Soyad</span>
                          <span className="flex-1">{personnel.ad_soyad}</span>
                        </div>
                        
                        {/* Doğum Tarihi */}
                        <div className="flex items-center border-b pb-3">
                          <Calendar className="h-4 w-4 text-purple-500 mr-3" />
                          <span className="w-28 text-muted-foreground">Doğum Tarihi</span>
                          <span className="flex-1">
                            {personnel.birth_date 
                              ? new Date(personnel.birth_date).toLocaleDateString('tr-TR')
                              : "Belirtilmemiş"}
                          </span>
                        </div>
                        
                        {/* Telefon */}
                        <div className="flex items-center border-b pb-3">
                          <Phone className="h-4 w-4 text-purple-500 mr-3" />
                          <span className="w-28 text-muted-foreground">Telefon</span>
                          <span className="flex-1">{personnel.telefon || "Belirtilmemiş"}</span>
                          {personnel.telefon && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopy(personnel.telefon, "Telefon numarası")}
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* E-posta */}
                        <div className="flex items-center border-b pb-3">
                          <Mail className="h-4 w-4 text-purple-500 mr-3" />
                          <span className="w-28 text-muted-foreground">E-posta</span>
                          <span className="flex-1">{personnel.eposta || "Belirtilmemiş"}</span>
                          {personnel.eposta && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopy(personnel.eposta, "E-posta adresi")}
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Adres */}
                        <div className="flex items-start border-b pb-3">
                          <MapPin className="h-4 w-4 text-purple-500 mr-3 mt-1" />
                          <span className="w-28 text-muted-foreground mt-0.5">Adres</span>
                          <span className="flex-1">{personnel.adres || "Belirtilmemiş"}</span>
                        </div>
                        
                        {/* IBAN */}
                        <div className="flex items-center border-b pb-3">
                          <CreditCard className="h-4 w-4 text-purple-500 mr-3" />
                          <span className="w-28 text-muted-foreground">IBAN</span>
                          <span className="flex-1 font-mono text-sm">
                            {formatIBAN(personnel.iban)}
                          </span>
                          {personnel.iban && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopy(personnel.iban, "IBAN")}
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="work-info">
                <div className="space-y-6">
                  {!isEditing ? (
                    <>
                      <div className="flex justify-end mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Düzenle
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Çalışma Bilgileri</h3>
                          <div className="space-y-4">
                            <div className="flex items-center border-b pb-3">
                              <span className="w-36 text-muted-foreground">Çalışma Sistemi</span>
                              <span>
                                {personnel.calisma_sistemi === "aylik_maas" ? "Aylık Maaşlı" : 
                                 personnel.calisma_sistemi === "haftalik_maas" ? "Haftalık Maaşlı" : 
                                 personnel.calisma_sistemi === "gunluk_maas" ? "Günlük Maaşlı" :
                                 "Yüzdelik Çalışan"}
                              </span>
                            </div>
                            
                            {["aylik_maas", "haftalik_maas", "gunluk_maas"].includes(personnel.calisma_sistemi) && (
                              <div className="flex items-center border-b pb-3">
                                <span className="w-36 text-muted-foreground">Maaş Bilgisi</span>
                                <span>
                                  {formatCurrency(personnel.maas || 0)}
                                </span>
                              </div>
                            )}
                            
                            {personnel.calisma_sistemi === "prim_komisyon" && (
                              <div className="flex items-center border-b pb-3">
                                <span className="w-36 text-muted-foreground">Prim Oranı</span>
                                <span>%{personnel.prim_yuzdesi}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h3 className="text-lg font-medium mb-4">Çalışma Bilgilerini Düzenle</h3>
                      
                      {/* Çalışma Türü Seçimi */}
                      <div className="mb-6">
                        <p className="text-sm text-muted-foreground mb-3">Çalışma Türü</p>
                        <RadioGroup 
                          value={workingForm.calisma_sistemi} 
                          onValueChange={(value) => setWorkingForm({
                            ...workingForm,
                            calisma_sistemi: value,
                            // Reset values when switching
                            maas: value === "prim_komisyon" ? 0 : workingForm.maas,
                            prim_yuzdesi: value !== "prim_komisyon" ? 0 : workingForm.prim_yuzdesi
                          })}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="aylik_maas" id="aylik" />
                            <Label htmlFor="aylik">Maaşlı</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="prim_komisyon" id="prim" />
                            <Label htmlFor="prim">Komisyonlu</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Maaşlı Seçildiyse */}
                      {workingForm.calisma_sistemi !== "prim_komisyon" && (
                        <>
                          <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-3">Periyot</p>
                            <RadioGroup 
                              value={workingForm.calisma_sistemi} 
                              onValueChange={(value) => setWorkingForm({
                                ...workingForm,
                                calisma_sistemi: value
                              })}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="gunluk_maas" id="gunluk" />
                                <Label htmlFor="gunluk">Günlük</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="haftalik_maas" id="haftalik" />
                                <Label htmlFor="haftalik">Haftalık</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="aylik_maas" id="aylik2" />
                                <Label htmlFor="aylik2">Aylık</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="mb-6">
                            <Label htmlFor="maas">Maaş Miktarı</Label>
                            <div className="relative mt-2">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2">₺</span>
                              <Input
                                id="maas"
                                type="number"
                                className="pl-8"
                                value={workingForm.maas}
                                onChange={(e) => setWorkingForm({
                                  ...workingForm,
                                  maas: Number(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Komisyonlu Seçildiyse */}
                      {workingForm.calisma_sistemi === "prim_komisyon" && (
                        <div className="mb-6">
                          <Label htmlFor="prim">Prim Yüzdesi (%)</Label>
                          <div className="relative mt-2">
                            <Input
                              id="prim"
                              type="number"
                              max="100"
                              value={workingForm.prim_yuzdesi}
                              onChange={(e) => setWorkingForm({
                                ...workingForm,
                                prim_yuzdesi: Number(e.target.value)
                              })}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-3 mt-8">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            // Reset form to original values
                            setWorkingForm({
                              calisma_sistemi: personnel.calisma_sistemi,
                              maas: personnel.maas || 0,
                              prim_yuzdesi: personnel.prim_yuzdesi || 0,
                            });
                          }}
                        >
                          İptal
                        </Button>
                        <Button onClick={handleSaveChanges}>
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <PersonnelOperationsTable personnelId={personnel.id} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      <PersonnelDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        personnelId={personnel?.id}
        personnelName={personnel?.ad_soyad}
      />
    </>
  );
}
