import { useQuery } from '@tanstack/react-query';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { gunSiralama } from '../../constants/workingDays';

/**
 * Custom hook to fetch and manage working hours data
 */
export function useWorkingHoursData(providedGunler: CalismaSaati[] = [], dukkanId?: number) {
  // If dukkanId is provided, fetch hours for that shop
  const { 
    data: fetchedCalismaSaatleri = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['calisma_saatleri', dukkanId],
    queryFn: async () => {
      console.log("useWorkingHours: Fetching working hours, dukkanId:", dukkanId);
      try {
        let data;
        if (dukkanId) {
          // If we have a shop ID, get hours for that shop
          data = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        } else {
          // Otherwise get all hours
          data = await calismaSaatleriServisi.hepsiniGetir();
        }
        
        // If no data returned, create default working hours
        if (!data || data.length === 0) {
          // Create default working hours
          data = gunSiralama.map((gun, index) => ({
            id: -(index + 1), // Using negative IDs to indicate these are temporary
            gun,
            acilis: "09:00",
            kapanis: "18:00",
            kapali: false,
            dukkan_id: dukkanId || 0
          }));
        }
        
        console.log("Working hours retrieved:", data);
        return data;
      } catch (err) {
        console.error("Error fetching working hours:", err);
        throw err;
      }
    },
    staleTime: 30000 // 30 seconds
  });

  // Use the provided working hours if available, otherwise use the fetched ones
  const calismaSaatleri = providedGunler.length > 0 ? providedGunler : fetchedCalismaSaatleri;

  // Always sort by predefined day order
  const sortedSaatler = [...calismaSaatleri].sort((a, b) => {
    const aIndex = gunSiralama.indexOf(a.gun);
    const bIndex = gunSiralama.indexOf(b.gun);
    return aIndex - bIndex;
  });

  return {
    calismaSaatleri: sortedSaatler,
    isLoading,
    error,
    refetch
  };
}
