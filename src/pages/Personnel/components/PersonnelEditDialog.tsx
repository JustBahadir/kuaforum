
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Personel, personelServisi, profilServisi } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Copy, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface PersonnelEditDialogProps {
  personelId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditComplete?: () => void;
}

export function PersonnelEditDialog({ personelId, open, onOpenChange, onEditComplete }: PersonnelEditDialogProps) {
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const [formattedIBAN, setFormattedIBAN] = useState<string>('');
  const [calisma_sistemi, setCalisma_sistemi] = useState<string>('aylik_maas');
  const [baslama_tarihi, setBaslama_tarihi] = useState<Date | undefined>(undefined);
  const [aktif, setAktif] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isSaving, setIsSaving] = useState(false);
  const { userRole } = useCustomerAuth();
  const queryClient = useQueryClient();

  // Fetch personel data based on personelId
  const { data: personel, isLoading, refetch } = useQuery({
    queryKey: ['personel', personelId],
    queryFn: () => personelServisi.getirById(personelId),
    enabled: open && personelId > 0,
    retry: 3,
    retryDelay: 1000
  });

  // Update personelDuzenle state when personel data is loaded
  useEffect(() => {
    if (personel) {
      setPersonelDuzenle(personel);
      // Format IBAN if it exists
      if (personel.iban) {
        setFormattedIBAN(profilServisi.formatIBAN(personel.iban));
      } else {
        setFormattedIBAN('');
      }
      
      // Set working type
      setCalisma_sistemi(personel.calisma_sistemi || 'aylik_maas');
      
      // Set start date
      if (personel.baslama_tarihi) {
        setBaslama_tarihi(new Date(personel.baslama_tarihi));
      }
      
      // Set active status
      setAktif(personel.aktif !== false);
    }
  }, [personel]);

  // Copy IBAN to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("IBAN kopyalandı");
  };

  const { mutate: personelGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personel> }) =>
      personelServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      setIsSaving(false);
      toast.success("Personel başarıyla güncellendi.");
      onOpenChange(false);
      if (onEditComplete) {
        onEditComplete();
      }
    },
    onError: (error) => {
      setIsSaving(false);
      toast.error("Personel güncellenirken bir hata oluştu: " + (error as Error).message);
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (personelDuzenle) {
      setIsSaving(true);
      
      // Only send the fields that should be editable by admin
      const { id } = personelDuzenle;
      const guncellenecekVeriler: Partial<Personel> = {
        maas: personelDuzenle.maas,
        gunluk_ucret: personelDuzenle.gunluk_ucret,
        haftalik_ucret: personelDuzenle.haftalik_ucret,
        prim_yuzdesi: personelDuzenle.prim_yuzdesi,
        calisma_sistemi: calisma_sistemi,
        baslama_tarihi: baslama_tarihi ? baslama_tarihi.toISOString() : undefined,
        aktif: aktif
      };
      
      console.log("Güncellenecek veriler:", guncellenecekVeriler);
      personelGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  // Define color based on working type
  const getWorkingTypeColor = (type: string): string => {
    switch (type) {
      case 'aylik_maas':
        return 'bg-blue-100 text-blue-800';
      case 'prim_komisyon':
        return 'bg-green-100 text-green-800';
      case 'gunluk_yevmiye':
        return 'bg-orange-100 text-orange-800';
      case 'haftalik_yevmiye':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !personelDuzenle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Düzenle</DialogTitle>
            <DialogDescription>Personel bilgileri yükleniyor, lütfen bekleyin...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleUpdate}>
          <DialogHeader>
            <DialogTitle>Personel Düzenle</DialogTitle>
            <DialogDescription>
              Personel bilgilerini düzenleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="work">Çalışma Bilgileri</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_ad_soyad">Ad Soyad</Label>
                  <Input
                    id="edit_ad_soyad"
                    value={personelDuzenle.ad_soyad}
                    className="bg-gray-100"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500">Ad Soyad bilgisi personel profilinden senkronize edilecektir.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_telefon">Telefon</Label>
                  <Input
                    id="edit_telefon"
                    type="tel"
                    value={personelDuzenle.telefon}
                    className="bg-gray-100"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500">Telefon bilgisi personel profilinden senkronize edilecektir.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_eposta">E-posta</Label>
                  <Input
                    id="edit_eposta"
                    type="email"
                    value={personelDuzenle.eposta}
                    className="bg-gray-100"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500">E-posta bilgisi personel profilinden senkronize edilecektir.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_adres">Adres</Label>
                  <Input
                    id="edit_adres"
                    value={personelDuzenle.adres}
                    className="bg-gray-100"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500">Adres bilgisi personel profilinden senkronize edilecektir.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_iban">IBAN</Label>
                  <div className="flex">
                    <Input
                      id="edit_iban"
                      value={formattedIBAN}
                      className="bg-gray-100 flex-1"
                      disabled={true}
                    />
                    {formattedIBAN && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(formattedIBAN)}
                        className="ml-2"
                      >
                        <Copy size={16} />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    IBAN bilgisi personel profilinden senkronize edilecektir.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="work" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_calisma_sistemi">Çalışma Şekli</Label>
                  <Select 
                    value={calisma_sistemi} 
                    onValueChange={(value) => setCalisma_sistemi(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Çalışma şekli seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aylik_maas">Sabit Aylık Maaş</SelectItem>
                      <SelectItem value="gunluk_yevmiye">Günlük Yevmiye</SelectItem>
                      <SelectItem value="haftalik_yevmiye">Haftalık Yevmiye</SelectItem>
                      <SelectItem value="prim_komisyon">Prim / Komisyon</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Personelin çalışma şekli değiştiğinde ücret alanları da otomatik güncellenir.</p>
                </div>
                
                {calisma_sistemi === 'aylik_maas' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit_maas">Aylık Maaş (₺)</Label>
                    <Input
                      id="edit_maas"
                      type="number"
                      value={personelDuzenle.maas || 0}
                      onChange={(e) =>
                        setPersonelDuzenle((prev) =>
                          prev ? { ...prev, maas: Number(e.target.value) } : null
                        )
                      }
                      required
                    />
                  </div>
                )}
                
                {calisma_sistemi === 'gunluk_yevmiye' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit_gunluk_ucret">Günlük Ücret (₺)</Label>
                    <Input
                      id="edit_gunluk_ucret"
                      type="number"
                      value={personelDuzenle.gunluk_ucret || 0}
                      onChange={(e) =>
                        setPersonelDuzenle((prev) =>
                          prev ? { ...prev, gunluk_ucret: Number(e.target.value) } : null
                        )
                      }
                      required
                    />
                  </div>
                )}
                
                {calisma_sistemi === 'haftalik_yevmiye' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit_haftalik_ucret">Haftalık Ücret (₺)</Label>
                    <Input
                      id="edit_haftalik_ucret"
                      type="number"
                      value={personelDuzenle.haftalik_ucret || 0}
                      onChange={(e) =>
                        setPersonelDuzenle((prev) =>
                          prev ? { ...prev, haftalik_ucret: Number(e.target.value) } : null
                        )
                      }
                      required
                    />
                  </div>
                )}
                
                {calisma_sistemi === 'prim_komisyon' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit_prim_yuzdesi">Komisyon Oranı (%)</Label>
                    <Input
                      id="edit_prim_yuzdesi"
                      type="number"
                      value={personelDuzenle.prim_yuzdesi || 0}
                      onChange={(e) =>
                        setPersonelDuzenle((prev) =>
                          prev ? { ...prev, prim_yuzdesi: Number(e.target.value) } : null
                        )
                      }
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="edit_baslama_tarihi">İşe Başlama Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="edit_baslama_tarihi"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {baslama_tarihi ? (
                          format(baslama_tarihi, "PP", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={baslama_tarihi}
                        onSelect={setBaslama_tarihi}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="aktif"
                    checked={aktif}
                    onCheckedChange={setAktif}
                  />
                  <Label htmlFor="aktif">Personel Aktif</Label>
                  <p className="text-xs text-gray-500 ml-2">
                    {aktif ? "Personel aktif olarak çalışıyor" : "Personel pasif durumda"}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
