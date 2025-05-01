
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { isletmeServisi } from "@/lib/supabase/services/dukkanServisi";
import { authService } from "@/lib/auth/authService";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";

export function useShopData(isletmeId?: number | null) {
  const [isletmeData, setIsletmeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isletmeId) {
          const user = await authService.getCurrentUser();
          if (!user) {
            throw new Error("Kullanıcı bulunamadı");
          }
          
          const isletme = await isletmeServisi.kullanicininIsletmesi(user.id);
          if (!isletme) {
            setError("İşletme bulunamadı. Lütfen önce işletme bilgilerinizi oluşturun.");
            setLoading(false);
            return;
          }
          
          setIsletmeData(isletme);
        } else {
          const isletme = await isletmeServisi.getirById(isletmeId);
          if (!isletme) {
            setError("İşletme bilgileri alınamadı.");
            setLoading(false);
            return;
          }
          
          setIsletmeData(isletme);
        }
      } catch (err) {
        console.error("İşletme bilgileri alınırken hata:", err);
        setError("İşletme bilgileri alınamadı: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isletmeId]);

  const { data: personelListesi = [] } = useQuery({
    queryKey: ['personel', isletmeData?.id || isletmeId],
    queryFn: async () => {
      const shopId = isletmeId || isletmeData?.id;
      if (!shopId) return [];
      
      try {
        const { data, error } = await supabase
          .from('personel')
          .select('*, auth_id')
          .eq('dukkan_id', shopId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const enhancedData = await Promise.all(data.map(async (personel) => {
            if (personel.auth_id) {
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', personel.auth_id)
                  .maybeSingle();
                
                if (profileData) {
                  personel.avatar_url = profileData.avatar_url;
                }
              } catch (profileError) {
                console.error("Profile data fetch error:", profileError);
              }
            }
            return personel;
          }));
          
          return enhancedData;
        }
        
        return data || [];
      } catch (error) {
        console.error("Personel listesi alınırken hata:", error);
        return [];
      }
    },
    enabled: !!(isletmeData?.id || isletmeId)
  });

  const { data: calisma_saatleri = [], isLoading: isLoadingSaatler } = useQuery({
    queryKey: ['dukkan_saatleri', isletmeData?.id || isletmeId],
    queryFn: async () => {
      try {
        const shopId = isletmeData?.id || isletmeId;
        if (!shopId) return [];
        
        console.log("useShopData: Fetching working hours for shop ID:", shopId);
        const data = await calismaSaatleriServisi.dukkanSaatleriGetir(shopId);
        console.log("useShopData: Fetched working hours:", data);
        
        return data;
      } catch (error) {
        console.error("Çalışma saatleri alınırken hata:", error);
        return [];
      }
    },
    enabled: !!(isletmeData?.id || isletmeId),
    staleTime: 30000 // Refresh every 30 seconds
  });

  return { 
    isletmeData, 
    setIsletmeData, 
    loading, 
    error, 
    personelListesi, 
    calisma_saatleri,
    isLoadingSaatler
  };
}
