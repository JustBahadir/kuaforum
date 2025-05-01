
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { toast } from "sonner";

export function useWorkingHours(dukkanId?: number) {
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
        let shopId = dukkanId;
        
        if (shopId === null || shopId === undefined) {
          shopId = await calismaSaatleriServisi.getCurrentDukkanId();
          console.log("Got shop ID from service:", shopId);
        }
        
        if (!shopId) {
          console.error("No shop ID available for working hours");
          throw new Error("İşletme bilgisi bulunamadı");
        }
        
        const result = await calismaSaatleriServisi.hepsiniGetir(shopId);
        console.log("Fetched working hours:", result);
        return result;
      } catch (error: any) {
        console.error("Error fetching working hours:", error);
        toast.error(`Çalışma saatleri yüklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`, {
          position: "bottom-right"
        });
        throw error;
      }
    },
    staleTime: 0, // Always refetch data 
    retry: 1
  });
  
  return { hours, isLoading, isError, refetch, error };
}
