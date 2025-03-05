
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { dukkanServisi } from "@/lib/supabase";
import { authService } from "@/lib/auth/authService";
import { gunSirasi } from "@/components/operations/constants/workingDays";

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
        // First get all personnel for the shop
        const { data, error } = await supabase
          .from('personel')
          .select('*, auth_id')
          .eq('dukkan_id', shopId);
          
        if (error) throw error;
        
        // Then for each personnel with an auth_id, get their profile picture
        if (data && data.length > 0) {
          const enhancedData = await Promise.all(data.map(async (personel) => {
            if (personel.auth_id) {
              try {
                // Try to get profile avatar from profiles table
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('avatar_url')
                  .eq('id', personel.auth_id)
                  .maybeSingle();
                
                if (profileData?.avatar_url) {
                  personel.avatar_url = profileData.avatar_url;
                } else {
                  // If not in profiles table, try to get from auth user metadata
                  const { data: userData } = await supabase.auth.admin.getUserById(personel.auth_id);
                  if (userData?.user?.user_metadata?.avatar_url) {
                    personel.avatar_url = userData.user.user_metadata.avatar_url;
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

  const { data: calisma_saatleri = [] } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calisma_saatleri')
          .select('*');
          
        if (error) throw error;
        
        // Sort days correctly from Monday to Sunday using the gunSirasi object
        return data.sort((a, b) => {
          const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
          const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
          return aIndex - bIndex;
        });
      } catch (error) {
        console.error("Çalışma saatleri alınırken hata:", error);
        return [];
      }
    }
  });

  return { dukkanData, setDukkanData, loading, error, personelListesi, calisma_saatleri };
}
