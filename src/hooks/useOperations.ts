
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface Operation {
  id: number;
  ad: string;
  fiyat: number;
  sure: number;
  [key: string]: any;
}

export function useOperations(shopId: number) {
  const fetchOperations = async (): Promise<Operation[]> => {
    const { data, error } = await supabase
      .from("islemler")
      .select("*")
      .eq("dukkan_id", shopId);

    if (error) {
      console.error("Error fetching operations:", error);
      throw error;
    }

    return data || [];
  };

  return useQuery({
    queryKey: ["operations", shopId],
    queryFn: fetchOperations,
    enabled: !!shopId,
    staleTime: 60000,
  });
}
