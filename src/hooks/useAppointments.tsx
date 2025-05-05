
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { randevuServisi } from '@/lib/supabase';
import { Randevu, RandevuDurum } from '@/lib/supabase/types';

interface UseAppointmentsProps {
  isletmeKimlik?: string;
  personelKimlik?: string;
  tarih?: string;
  durum?: RandevuDurum;
}

export const useAppointments = ({ isletmeKimlik, personelKimlik, tarih, durum }: UseAppointmentsProps = {}) => {
  const [randevular, setRandevular] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  const fetchRandevular = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let data: Randevu[] = [];
      
      // 1. Eğer işletmeKimlik verilmiş ise işletmenin randevularını getir
      if (isletmeKimlik) {
        data = await randevuServisi.isletmeyeGoreGetir(isletmeKimlik);
      } 
      // 2. Eğer personelKimlik verilmiş ise personelin randevularını getir
      else if (personelKimlik) {
        data = await randevuServisi.kendiRandevulariniGetir(personelKimlik);
      }
      // 3. Eğer hiçbiri verilmemiş ise kullanıcının rolüne göre al
      else {
        const { data: profilData } = await supabase
          .from('kullanicilar')
          .select('rol')
          .eq('kimlik', user.id)
          .single();
          
        if (profilData?.rol === 'isletme_sahibi') {
          // İşletme sahibi ise, işletmesinin randevularını getir
          const isletme = await supabase
            .from('isletmeler')
            .select('kimlik')
            .eq('sahip_kimlik', user.id)
            .single();
            
          if (isletme.data) {
            data = await randevuServisi.isletmeyeGoreGetir(isletme.data.kimlik);
          }
        } else if (profilData?.rol === 'personel') {
          // Personel ise kendi randevularını getir
          const personel = await supabase
            .from('personeller')
            .select('kimlik')
            .eq('kullanici_kimlik', user.id)
            .single();
            
          if (personel.data) {
            data = await randevuServisi.kendiRandevulariniGetir(personel.data.kimlik);
          }
        }
      }
      
      // Filtrele: Tarih
      if (tarih && data.length > 0) {
        data = data.filter(r => r.tarih === tarih);
      }
      
      // Filtrele: Durum
      if (durum && data.length > 0) {
        data = data.filter(r => r.durum === durum);
      }
      
      setRandevular(data);
    } catch (err: any) {
      console.error('Randevular getirme hatası:', err);
      setError(err);
      toast.error('Randevular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Durum güncelleme
  const durumGuncelle = async (randevuKimlik: string, durum: RandevuDurum) => {
    try {
      const guncellenmis = await randevuServisi.durumGuncelle(randevuKimlik, durum);
      if (guncellenmis) {
        setRandevular(oncekiRandevular => 
          oncekiRandevular.map(r => 
            r.kimlik === randevuKimlik ? { ...r, durum } : r
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Randevu durumu güncelleme hatası:', err);
      toast.error('Randevu durumu güncellenirken bir hata oluştu');
      return false;
    }
  };

  // Randevu silme
  const randevuSil = async (randevuKimlik: string) => {
    try {
      const basarili = await randevuServisi.sil(randevuKimlik);
      if (basarili) {
        setRandevular(oncekiRandevular => 
          oncekiRandevular.filter(r => r.kimlik !== randevuKimlik)
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Randevu silme hatası:', err);
      toast.error('Randevu silinirken bir hata oluştu');
      return false;
    }
  };

  // Kullanıcı değişikliğinde yeniden yükle
  useEffect(() => {
    if (user) {
      fetchRandevular();
    }
  }, [user, isletmeKimlik, personelKimlik, tarih, durum]);

  return {
    randevular,
    loading,
    error,
    yenile: fetchRandevular,
    durumGuncelle,
    randevuSil
  };
};
