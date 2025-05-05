
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { getDefaultWorkingHours } from '../utils/workingHoursUtils';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';

export const useWorkingHours = (dukkanId?: string) => {
  const [calismaSaatleri, setCalismaSaatleri] = useState<CalismaSaati[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [guncelDukkanId, setGuncelDukkanId] = useState<string | null>(null);

  // Dükkan ID'si gelmediyse güncel dükkan ID'sini al
  useEffect(() => {
    const dukkanIdGetir = async () => {
      try {
        if (dukkanId) {
          setGuncelDukkanId(dukkanId);
          return;
        }

        // Güncel dükkan ID'si al
        const id = await calismaSaatleriServisi.getCurrentDukkanId();
        
        if (id) {
          setGuncelDukkanId(id);
        } else {
          setHata("Dükkan bilgisi bulunamadı");
        }
      } catch (error) {
        console.error("Dükkan ID getirme hatası:", error);
        setHata("Dükkan bilgisi alınamadı");
      }
    };

    dukkanIdGetir();
  }, [dukkanId]);

  // Çalışma saatlerini getir
  useEffect(() => {
    const saatleriGetir = async () => {
      try {
        if (!guncelDukkanId) return;

        setYukleniyor(true);
        
        // Çalışma saatlerini getir
        const saatler = await calismaSaatleriServisi.dukkanSaatleriGetir(guncelDukkanId);
        
        setCalismaSaatleri(saatler);
      } catch (error) {
        console.error("Çalışma saatleri getirme hatası:", error);
        setHata("Çalışma saatleri alınamadı");
        
        // Varsayılan saatler
        if (guncelDukkanId) {
          setCalismaSaatleri(getDefaultWorkingHours(guncelDukkanId));
        }
      } finally {
        setYukleniyor(false);
      }
    };

    if (guncelDukkanId) {
      saatleriGetir();
    }
  }, [guncelDukkanId]);

  // Çalışma saatlerini kaydet
  const saatleriKaydet = async () => {
    try {
      if (!calismaSaatleri.length) {
        throw new Error("Kaydedilecek çalışma saati bulunamadı");
      }
      
      await calismaSaatleriServisi.saatleriKaydet(calismaSaatleri);
      
      toast.success("Çalışma saatleri başarıyla güncellendi", {
        position: "bottom-right"
      });
      
      return true;
    } catch (error) {
      console.error("Çalışma saatleri kaydetme hatası:", error);
      toast.error("Çalışma saatleri güncellenemedi", {
        position: "bottom-right"
      });
      return false;
    }
  };

  // Çalışma saatlerini sıfırla
  const saatleriSifirla = () => {
    if (guncelDukkanId) {
      setCalismaSaatleri(getDefaultWorkingHours(guncelDukkanId));
    }
  };

  return {
    calismaSaatleri,
    setCalismaSaatleri,
    yukleniyor,
    hata,
    saatleriKaydet,
    saatleriSifirla,
    guncelDukkanId
  };
};
