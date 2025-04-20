
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface Personnel {
  id: number;
  ad: string;
  soyad: string;
  hizmetler?: { id: number; [key: string]: any }[]; // services this personnel can perform
  [key: string]: any;
}

export function usePersonnel(shopId: number) {
  const fetchPersonnel = async (): Promise<Personnel[]> => {
    const { data, error } = await supabase
      .from("personel")
      .select("*, hizmetler (id)")
      .eq("dukkan_id", shopId);

    if (error) {
      console.error("Error fetching personnel:", error);
      throw error;
    }

    return data || [];
  };

  return useQuery({
    queryKey: ["personnel", shopId],
    queryFn: fetchPersonnel,
    enabled: !!shopId,
    staleTime: 60000,
  });
}
