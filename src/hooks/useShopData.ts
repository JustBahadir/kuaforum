
import { useState, useEffect } from 'react';
import { isletmeServisi, personelServisi, calismaSaatleriServisi } from '@/lib/supabase';

/**
 * Custom hook to get shop data including working hours, staff, etc.
 */
export function useShopData() {
  const [isletme, setIsletme] = useState<any>(null);
  const [personel, setPersonel] = useState<any[]>([]);
  const [calismaSaatleri, setCalismaSaatleri] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user's business
      const isletmeVerisi = await isletmeServisi.kullaniciIsletmesiniGetir();
      
      if (isletmeVerisi) {
        setIsletme(isletmeVerisi);
        
        // Get staff for this business
        const personelVerisi = await personelServisi.isletmeyeGoreGetir(isletmeVerisi.kimlik);
        setPersonel(personelVerisi);
        
        // Get working hours
        const saatlerVerisi = await calismaSaatleriServisi.isletmeyeGoreGetir(isletmeVerisi.kimlik);
        setCalismaSaatleri(saatlerVerisi);
      }
    } catch (error) {
      console.error("İşletme verileri yüklenirken hata:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isletme,
    personel,
    calismaSaatleri,
    loading,
    error,
    yenile: fetchData
  };
}
