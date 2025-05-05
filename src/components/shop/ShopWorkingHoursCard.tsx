
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { defaultCalismaSaatleriOlustur, gunler } from "../operations/utils/workingHoursUtils";
import { CalismaSaati } from "@/lib/supabase/types";
import { useAuth } from "@/hooks/useAuth";

interface ShopWorkingHoursCardProps {
  isletmeId: string;
}

export function ShopWorkingHoursCard({ isletmeId }: ShopWorkingHoursCardProps) {
  const [calismaSaatleri, setCalismaSaatleri] = useState<CalismaSaati[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Saat seçenekleri
  const saatSecenekleri = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const saat = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
      saatSecenekleri.push(saat);
    }
  }
  saatSecenekleri.push("23:59");

  // Çalışma saatlerini yükle
  useEffect(() => {
    if (!isletmeId) return;

    const saatleriYukle = async () => {
      setLoading(true);
      try {
        const saatler = await calismaSaatleriServisi.isletmeyeGoreGetir(isletmeId);
        
        if (saatler && saatler.length > 0) {
          setCalismaSaatleri(saatler);
        } else {
          // İşletme için varsayılan çalışma saatleri oluştur
          const varsayilanSaatler = defaultCalismaSaatleriOlustur(isletmeId);
          setCalismaSaatleri(varsayilanSaatler);
        }
      } catch (error) {
        console.error("Çalışma saatleri yüklenirken hata:", error);
        toast.error("Çalışma saatleri yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    saatleriYukle();
  }, [isletmeId]);

  // Çalışma saatlerini güncelle
  const handleSaatGuncelle = (index: number, alan: keyof CalismaSaati, deger: any) => {
    const yeniSaatler = [...calismaSaatleri];
    yeniSaatler[index] = {
      ...yeniSaatler[index],
      [alan]: deger
    };
    setCalismaSaatleri(yeniSaatler);
  };

  // Tüm değişiklikleri kaydet
  const handleKaydet = async () => {
    if (calismaSaatleri.length === 0) return;
    
    setSaving(true);
    try {
      // Her birini ayrı ayrı güncelleyelim ya da hepsini toplu güncelleyelim
      const sonuc = await calismaSaatleriServisi.topluGuncelle(
        calismaSaatleri.map(saat => ({
          ...saat,
          isletme_id: isletmeId
        }))
      );
      
      if (sonuc) {
        toast.success("Çalışma saatleri başarıyla güncellendi.");
        setCalismaSaatleri(sonuc);
      }
    } catch (error) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error("Çalışma saatleri kaydedilirken bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {calismaSaatleri.map((saat, index) => (
              <div key={index} className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <Label>{saat.gun}</Label>
                <div className="grid grid-cols-[1fr_80px_1fr_80px] gap-2 items-center">
                  <Select
                    value={saat.acilis}
                    onValueChange={(value) => handleSaatGuncelle(index, "acilis", value)}
                    disabled={saat.kapali}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Açılış" />
                    </SelectTrigger>
                    <SelectContent>
                      {saatSecenekleri.map((s) => (
                        <SelectItem key={`acilis-${s}`} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-center">-</span>
                  <Select
                    value={saat.kapanis}
                    onValueChange={(value) => handleSaatGuncelle(index, "kapanis", value)}
                    disabled={saat.kapali}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kapanış" />
                    </SelectTrigger>
                    <SelectContent>
                      {saatSecenekleri.map((s) => (
                        <SelectItem key={`kapanis-${s}`} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`kapali-${index}`}
                      checked={!saat.kapali}
                      onCheckedChange={(checked) => handleSaatGuncelle(index, "kapali", !checked)}
                    />
                    <Label htmlFor={`kapali-${index}`} className="text-sm">Açık</Label>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={handleKaydet} 
              disabled={saving || !user}
              className="w-full mt-4"
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ShopWorkingHoursCard;
