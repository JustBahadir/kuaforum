
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { createDefaultWorkingHours } from "../utils/workingHoursUtils";

export function useWorkingHours(dukkanId?: number | null) {
  const { 
    data: hours = [], 
    isLoading, 
    isError, 
    refetch,
    error
  } = useQuery({
    queryKey: ['workingHours', dukkanId],
    queryFn: async () => {
      try {
        console.log("useWorkingHours: Fetching working hours for dukkanId:", dukkanId);
        let shopId = dukkanId;
        
        if (shopId === null || shopId === undefined) {
          shopId = await calismaSaatleriServisi.getCurrentDukkanId();
          console.log("useWorkingHours: Retrieved dukkanId:", shopId);
        }
        
        if (!shopId) {
          console.error("useWorkingHours: No dukkan ID found");
          throw new Error("İşletme bilgisi bulunamadı");
        }
        
        const data = await calismaSaatleriServisi.dukkanSaatleriGetir(shopId);
        console.log("useWorkingHours: Fetched working hours:", data);
        
        // If no hours found, create defaults
        if (!data || data.length === 0) {
          console.log("useWorkingHours: Creating default working hours");
          const defaultHours = createDefaultWorkingHours(shopId);
          await calismaSaatleriServisi.saatleriKaydet(defaultHours);
          return defaultHours;
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching working hours:", error);
        throw error;
      }
    },
    staleTime: 5000, // 5 seconds
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  });
  
  return { hours, isLoading, isError, refetch, error };
}
