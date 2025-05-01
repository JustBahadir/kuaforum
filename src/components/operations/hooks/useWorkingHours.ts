
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";

export function useWorkingHours(dukkanId?: number) {
  const { 
    data: hours = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['workingHours', dukkanId],
    queryFn: async () => {
      try {
        let shopId = dukkanId;
        
        if (shopId === null || shopId === undefined) {
          shopId = await calismaSaatleriServisi.getCurrentDukkanId();
        }
        
        if (!shopId) {
          throw new Error("İşletme bilgisi bulunamadı");
        }
        
        return calismaSaatleriServisi.hepsiniGetir(shopId);
      } catch (error) {
        console.error("Error fetching working hours:", error);
        throw error;
      }
    }
  });
  
  return { hours, isLoading, isError, refetch };
}
