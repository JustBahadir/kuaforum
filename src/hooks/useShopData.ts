import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface IsletmeData {
  kimlik: string;
  id: string;
  kod: string;
  ad: string;
  adres?: string;
  telefon?: string;
  website?: string;
  aciklama?: string;
  logo_url?: string;
  kapak_url?: string;
  sahip_kimlik: string;
  il?: string;
  ilce?: string;
  puan?: number;
  sosyal_medya?: any;
  detaylar?: any;
  durum?: string;
}

export interface PersonelData {
  kimlik: string;
  id: string;
  kullanici_kimlik?: string;
  isletme_id: string;
  ad_soyad: string;
  telefon?: string;
  eposta?: string;
  adres?: string;
  unvan?: string;
  gorev?: string;
  maas?: number;
  prim_yuzdesi?: number;
  durum: string;
  izin_baslangic?: string;
  izin_bitis?: string;
  dogum_tarihi?: string;
  ise_baslama_tarihi?: string;
  personel_no?: string;
  calisma_sistemi?: string;
  iban?: string;
}

export interface CalismaSaatiData {
  id: string;
  isletme_id: string;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
}

// Add isletmeData to the return type of useIsletme
interface UseIsletmeReturn {
  isletme: IsletmeData | null;
  isletmeData: IsletmeData | null; // Adding this for backward compatibility
  personel: PersonelData[] | null;
  calismaSaatleri: CalismaSaatiData[] | null;
  loading: boolean;
  error: Error | null;
  yenile: () => void;
}

export function useIsletme(): UseIsletmeReturn {
  const [isletme, setIsletme] = useState<IsletmeData | null>(null);
  const [personel, setPersonel] = useState<PersonelData[] | null>(null);
  const [calismaSaatleri, setCalismaSaatleri] = useState<CalismaSaatiData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isletmeId = localStorage.getItem('isletmeId');

  const fetchIsletmeData = async () => {
    if (!isletmeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: isletmeData, error: isletmeError } = await supabase
        .from('isletmeler')
        .select('*')
        .eq('kimlik', isletmeId)
        .single();

      if (isletmeError) {
        throw isletmeError;
      }

      setIsletme(isletmeData);

      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .select('*')
        .eq('isletme_id', isletmeId);

      if (personelError) {
        throw personelError;
      }

      setPersonel(personelData);

      const { data: calismaSaatleriData, error: calismaSaatleriError } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('isletme_id', isletmeId);

      if (calismaSaatleriError) {
        throw calismaSaatleriError;
      }

      setCalismaSaatleri(calismaSaatleriData);
    } catch (err: any) {
      setError(err);
      console.error("İşletme verileri alınırken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIsletmeData();
  }, [isletmeId]);

  const yenile = () => {
    fetchIsletmeData();
  };
  
  return {
    isletme,
    isletmeData: isletme, // Adding this for backward compatibility
    personel,
    calismaSaatleri,
    loading,
    error,
    yenile
  };
}
