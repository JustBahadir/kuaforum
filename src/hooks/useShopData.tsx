import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { dukkanServisi } from "@/lib/supabase";
import { authService } from "@/lib/auth/authService";
import { gunSiralama } from "@/components/operations/constants/workingDays";

export function useShopData(dukkanId: number | null) {
  const [dukkanData, setDukkanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!dukkanId) {
          const user = await authService.getCurrentUser();
          if (!user) {
            throw new Error("Kullanıcı bulunamadı");
          }
          
          const dukkan = await dukkanServisi.kullanicininDukkani(user.id);
          if (!dukkan) {
            setError("Dükkan bulunamadı. Lütfen önce dükkan bilgilerinizi oluşturun.");
            setLoading(false);
            return;
          }
          
          setDukkanData(dukkan);
        } else {
          const dukkan = await dukkanServisi.getirById(dukkanId);
          if (!dukkan) {
            setError("Dükkan bilgileri alınamadı.");
            setLoading(false);
            return;
          }
          
          setDukkanData(dukkan);
        }
      } catch (err) {
        console.error("Dükkan bilgileri alınırken hata:", err);
        setError("Dükkan bilgileri alınamadı: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dukkanId]);

  const { data: personelListesi = [] } = useQuery({
    queryKey: ['personel', dukkanData?.id],
    queryFn: async () => {
      if (!dukkanId && !dukkanData?.id) return [];
      const shopId = dukkanId || dukkanData?.id;
      
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
                  .select('avatar_url')
                  .eq('id', personel.auth_id)
                  .maybeSingle();
                
                if (profileData?.avatar_url) {
                  personel.avatar_url = profileData.avatar_url;
                } else {
                  const { data: { user } } = await supabase.auth.admin.getUserById(personel.auth_id);
                  if (user?.user_metadata?.avatar_url) {
                    personel.avatar_url = user.user_metadata.avatar_url;
                  }
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
    enabled: !!dukkanId || !!dukkanData?.id
  });

  const { data: calisma_saatleri = [], isLoading: isLoadingSaatler } = useQuery({
    queryKey: ['calisma_saatleri', dukkanData?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calisma_saatleri')
          .select('*')
          .eq('dukkan_id', dukkanData?.id || dukkanId);
          
        if (error) throw error;
        
        return (data || []).sort((a, b) => {
          const aIndex = gunSiralama.indexOf(a.gun);
          const bIndex = gunSiralama.indexOf(b.gun);
          return aIndex - bIndex;
        });
      } catch (error) {
        console.error("Çalışma saatleri alınırken hata:", error);
        return [];
      }
    },
    enabled: !!dukkanData?.id || !!dukkanId
  });

  return { 
    dukkanData, 
    setDukkanData, 
    loading, 
    error, 
    personelListesi, 
    calisma_saatleri,
    isLoadingSaatler
  };
}
