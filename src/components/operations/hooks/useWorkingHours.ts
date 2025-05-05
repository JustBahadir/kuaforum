
import { useState, useEffect } from "react";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { CalismaSaati } from "@/lib/supabase/types";
import { toast } from "sonner";

// Varsayılan çalışma saatleri oluşturma
const getDefaultWorkingHours = (): Partial<CalismaSaati>[] => {
  return [
    { gun: "Pazartesi", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Salı", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Çarşamba", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Perşembe", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Cuma", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Cumartesi", acilis: "10:00", kapanis: "16:00", kapali: false },
    { gun: "Pazar", acilis: "10:00", kapanis: "16:00", kapali: true }
  ];
};

// Gün isimleri
export const gunIsimleri = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export const useWorkingHours = (isletmeId: string) => {
  const [calisma_saatleri, setCalisma_saatleri] = useState<Partial<CalismaSaati>[]>(getDefaultWorkingHours());
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydetmeBasarili, setKaydetmeBasarili] = useState<boolean | null>(null);

  // Çalışma saatlerini getir
  useEffect(() => {
    const saatleriGetir = async () => {
      if (!isletmeId) return;

      try {
        setYukleniyor(true);
        const saatler = await calismaSaatleriServisi.isletmeyeGoreGetir(isletmeId);
        
        if (saatler && saatler.length > 0) {
          setCalisma_saatleri(saatler);
        } else {
          // İşletmeye ait çalışma saati yoksa varsayılan saatleri kaydet
          const yeniSaatler = getDefaultWorkingHours().map(saat => ({
            ...saat,
            isletme_id: isletmeId
          }));
          
          const kaydedilenSaatler = await calismaSaatleriServisi.topluGuncelle(yeniSaatler);
          if (kaydedilenSaatler) {
            setCalisma_saatleri(kaydedilenSaatler);
          }
        }
      } catch (error) {
        console.error("Çalışma saatleri yüklenirken hata:", error);
        toast.error("Çalışma saatleri yüklenemedi");
      } finally {
        setYukleniyor(false);
      }
    };

    saatleriGetir();
  }, [isletmeId]);

  // Çalışma saatlerini güncelle
  const saatleriGuncelle = (index: number, alan: string, deger: string) => {
    const guncelSaatler = [...calisma_saatleri];
    guncelSaatler[index] = { 
      ...guncelSaatler[index], 
      [alan]: deger 
    };
    setCalisma_saatleri(guncelSaatler);
  };

  // Tüm çalışma saatlerini kaydet
  const saatleriKaydet = async () => {
    if (!isletmeId) return null;

    try {
      setYukleniyor(true);
      const guncelSaatler = calisma_saatleri.map(saat => ({
        ...saat,
        isletme_id: isletmeId
      }));
      
      const kaydedilenSaatler = await calismaSaatleriServisi.topluGuncelle(guncelSaatler);
      
      if (kaydedilenSaatler) {
        setCalisma_saatleri(kaydedilenSaatler);
        setKaydetmeBasarili(true);
        toast.success("Çalışma saatleri kaydedildi");
        return kaydedilenSaatler;
      }
      
      setKaydetmeBasarili(false);
      toast.error("Çalışma saatleri kaydedilemedi");
      return null;
    } catch (error) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      setKaydetmeBasarili(false);
      toast.error("Çalışma saatleri kaydedilemedi");
      return null;
    } finally {
      setYukleniyor(false);
    }
  };

  // Günü kapalı yap
  const gunuKapaliYap = (index: number, kapali: boolean) => {
    const guncelSaatler = [...calisma_saatleri];
    guncelSaatler[index] = { 
      ...guncelSaatler[index], 
      kapali 
    };
    setCalisma_saatleri(guncelSaatler);
  };

  // Bütün günleri aç
  const butunGunleriAc = () => {
    const guncelSaatler = calisma_saatleri.map(saat => ({
      ...saat,
      kapali: false
    }));
    setCalisma_saatleri(guncelSaatler);
  };

  // Çalışma saatlerini dışa aktar
  return {
    calisma_saatleri,
    gunIsimleri,
    yukleniyor,
    kaydetmeBasarili,
    saatleriGuncelle,
    saatleriKaydet,
    gunuKapaliYap,
    butunGunleriAc
  };
};
