
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { CalismaSaati } from "@/lib/supabase/types";
import { toast } from "sonner";

export function useWorkingHoursMutation(dukkanId: number | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const updateHoursMutation = useMutation({
    mutationFn: async (hours: CalismaSaati[]) => {
      if (!dukkanId) throw new Error("Dükkan ID bulunamadı");
      
      // Ensure all hours have the dukkan_id
      const preparedHours = hours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));
      
      return calismaSaatleriServisi.guncelle(preparedHours);
    },
    onSuccess: () => {
      toast.success("Çalışma saatleri başarıyla güncellendi");
      // Invalidate queries that depend on working hours
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
      queryClient.invalidateQueries({ queryKey: ['dukkan_saatleri'] });
    },
    onError: (error: any) => {
      console.error("Çalışma saatleri güncellenirken hata:", error);
      toast.error(`Güncelleme sırasında bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });

  const updateAllHours = async (hours: CalismaSaati[]) => {
    setIsLoading(true);
    try {
      await updateHoursMutation.mutateAsync(hours);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSingleDay = async (day: CalismaSaati) => {
    setIsLoading(true);
    try {
      await calismaSaatleriServisi.guncelle([day]);
      toast.success(`${day.gun} günü için çalışma saatleri güncellendi`);
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
      queryClient.invalidateQueries({ queryKey: ['dukkan_saatleri'] });
      return true;
    } catch (error: any) {
      toast.error(`Güncelleme sırasında bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateAllHours,
    updateSingleDay,
    isLoading,
    isUpdating: updateHoursMutation.isPending
  };
}
