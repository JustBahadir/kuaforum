import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface UseAvailableTimeSlotsParams {
  date?: Date;
  shopId: number;
  personnelId?: number;
}

export function useAvailableTimeSlots({ date, shopId, personnelId }: UseAvailableTimeSlotsParams) {
  // Format the date as yyyy-MM-dd (string) without time
  const formattedDate = date ? date.toISOString().split("T")[0] : undefined;

  const fetchAvailableTimeSlots = async (): Promise<string[]> => {
    if (!formattedDate) return [];

    const { data, error } = await supabase
      .from("get_available_time_slots")  // Assuming this is a table or RPC you have
      .select("*")
      .eq("tarih", formattedDate)
      .eq("dukkan_id", shopId)
      .filter(personnelId ? "personel_id" : "personel_id", "eq", personnelId ?? undefined);

    if (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }

    // However, since you have a Supabase Edge function get_available_time_slots, 
    // you might want to fetch via RPC or API. To keep it simple, below simulate the RPC call:

    // Alternative: call RPC version instead of table
    /*
    const { data, error } = await supabase.rpc("get_available_time_slots", {
      date: formattedDate,
      dukkanId: shopId,
      personelId: personnelId || null,
    });
    */
    // Return data or []
    return Array.isArray(data) ? (data as string[]) : [];
  };

  return useQuery({
    queryKey: ["availableTimeSlots", formattedDate, shopId, personnelId],
    queryFn: fetchAvailableTimeSlots,
    enabled: !!formattedDate && !!shopId,
    staleTime: 60000,
  });
}
