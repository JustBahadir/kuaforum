
import { useQuery, type RefetchOptions, type QueryObserverResult } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Personel } from "@/types/personnel";
import { useAuth } from "@/hooks/useAuth";

export function usePersonnel(options = {}) {
  const { dukkanId, isletmeId } = useAuth();
  
  return useQuery({
    queryKey: ["personnel", dukkanId || isletmeId],
    queryFn: async () => {
      if (!dukkanId && !isletmeId) {
        console.warn("No dukkanId or isletmeId available for personnel query");
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("personel")
          .select("*")
          .eq("isletme_id", isletmeId)
          .order("ad_soyad", { ascending: true });
          
        if (error) {
          console.error("Error fetching personnel:", error);
          throw error;
        }
        
        return data as Personel[];
      } catch (error) {
        console.error("Personnel fetch error:", error);
        throw error;
      }
    },
    ...options
  });
}
