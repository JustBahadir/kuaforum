
import { useState, useEffect } from "react";
import { randevuServisi, isletmeServisi } from "@/lib/supabase";
import { Randevu, RandevuDurum } from "@/lib/supabase/types";
import { toast } from "sonner";

export interface UseAppointmentsProps {
  isletmeId?: string;
  personelId?: string;
  musteriId?: string;
  tarih?: string;
}

export function useAppointments(props?: UseAppointmentsProps) {
  const [randevular, setRandevular] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  
  // For compatibility with existing code
  const [appointments, setAppointments] = useState<Randevu[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Partial<UseAppointmentsProps>>({});

  useEffect(() => {
    yenile();
  }, [props]);

  const yenile = async () => {
    try {
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      let veri: Randevu[] = [];
      
      // Eğer isletmeId belirtilmişse, o işletmeye ait randevuları getir
      if (props?.isletmeId) {
        veri = await randevuServisi.isletmeyeGoreGetir(props.isletmeId);
      } 
      // Eğer personelId belirtilmişse, o personele ait randevuları getir
      else if (props?.personelId) {
        veri = await randevuServisi.personeleGoreGetir(props.personelId);
      }
      // Eğer musteriId belirtilmişse, o müşteriye ait randevuları getir
      else if (props?.musteriId) {
        veri = await randevuServisi.musteriyeGoreGetir(props.musteriId);
      }
      // Eğer tarih belirtilmişse ve işletmeId de varsa, o tarihe ait randevuları getir
      else if (props?.tarih && props?.isletmeId) {
        veri = await randevuServisi.tariheGoreGetir(props.isletmeId, props.tarih);
      }
      // Hiçbir parametre belirtilmemişse, kullanıcının işletmesine ait tüm randevuları getir
      else {
        const isletmeId = await isletmeServisi.getCurrentUserIsletmeId();
        if (isletmeId) {
          veri = await randevuServisi.isletmeyeGoreGetir(isletmeId);
        }
      }
      
      setRandevular(veri);
      setAppointments(veri);
    } catch (err) {
      console.error("Randevular alınırken hata:", err);
      setError(err);
      toast.error("Randevular yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const durumGuncelle = async (randevuKimlik: string, durum: RandevuDurum): Promise<boolean> => {
    try {
      const basarili = await randevuServisi.durumGuncelle(randevuKimlik, durum);
      
      if (basarili) {
        // Başarılıysa state'i güncelle
        setRandevular((eskiRandevular) =>
          eskiRandevular.map((randevu) =>
            randevu.kimlik === randevuKimlik ? { ...randevu, durum } : randevu
          )
        );
        setAppointments((eskiRandevular) =>
          eskiRandevular.map((randevu) =>
            randevu.kimlik === randevuKimlik ? { ...randevu, durum } : randevu
          )
        );
        
        toast.success("Randevu durumu güncellendi");
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Randevu durumu güncellenirken hata:", err);
      toast.error("Randevu durumu güncellenemedi");
      return false;
    }
  };

  const randevuSil = async (randevuKimlik: string): Promise<boolean> => {
    try {
      const basarili = await randevuServisi.sil(randevuKimlik);
      
      if (basarili) {
        // Başarılıysa state'ten sil
        setRandevular((eskiRandevular) =>
          eskiRandevular.filter((randevu) => randevu.kimlik !== randevuKimlik)
        );
        setAppointments((eskiRandevular) =>
          eskiRandevular.filter((randevu) => randevu.kimlik !== randevuKimlik)
        );
        
        toast.success("Randevu silindi");
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Randevu silinirken hata:", err);
      toast.error("Randevu silinemedi");
      return false;
    }
  };

  // For existing code compatibility
  const refetch = yenile;

  return {
    randevular,
    appointments,
    loading,
    isLoading,
    error,
    yenile,
    refetch,
    durumGuncelle,
    randevuSil,
    filters,
    setFilters
  };
}
