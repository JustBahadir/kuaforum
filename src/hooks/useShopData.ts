
import { useState, useEffect } from "react";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { personelServisi } from "@/lib/supabase";
import { supabase } from "@/lib/supabase/client";

export const useShopData = (dukkanId?: number | null) => {
  const [isletmeData, setIsletmeData] = useState<any>(null);
  const [personelListesi, setPersonelListesi] = useState<any[]>([]);
  const [calisma_saatleri, setCalisma_saatleri] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShopData() {
      try {
        setLoading(true);
        setError(null);
        
        if (!dukkanId) {
          setLoading(false);
          setError("Dükkan ID bulunamadı");
          return;
        }
        
        // Load shop data
        const shopData = await dukkanServisi.getirById(dukkanId);
        if (!shopData) {
          throw new Error("İşletme bulunamadı");
        }
        setIsletmeData(shopData);
        
        // Load personnel list
        const personnelData = await personelServisi.hepsiniGetir(dukkanId);
        setPersonelListesi(personnelData || []);
        
        // Load working hours
        // Since dukkanSaatleriGetir doesn't exist, use direct Supabase query
        const { data: workingHoursData, error: whError } = await supabase
          .from('calisma_saatleri')
          .select('*')
          .eq('dukkan_id', dukkanId)
          .order('gun_sira', { ascending: true });
          
        if (whError) {
          throw whError;
        }
        
        setCalisma_saatleri(workingHoursData || []);
      } catch (err: any) {
        console.error("Shop data loading error:", err);
        setError(err.message || "İşletme bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    
    loadShopData();
  }, [dukkanId]);
  
  return {
    isletmeData,
    personelListesi,
    calisma_saatleri,
    loading,
    error
  };
};
