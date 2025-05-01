
// Fix the reference to getCurrentDukkanId

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { toast } from "sonner";

export const useWorkingHours = (dukkanId?: number) => {
  const [error, setError] = useState<string | null>(null);

  const {
    data: workingHours,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["working-hours", dukkanId],
    queryFn: async () => {
      try {
        const fetchedDukkanId = dukkanId || await calismaSaatleriServisi.getCurrentDukkanId();
        if (!fetchedDukkanId) {
          throw new Error("Dükkan bilgisi bulunamadı");
        }
        
        const hours = await calismaSaatleriServisi.hepsiniGetir(fetchedDukkanId);
        return hours;
      } catch (err: any) {
        setError(err.message || "Çalışma saatleri yüklenirken bir hata oluştu");
        toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
        throw err;
      }
    },
    retry: 1,
  });

  return {
    workingHours,
    isLoading,
    isError,
    error,
    refetch,
  };
};
