import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { CalismaSaati } from "@/lib/supabase/types";

export interface UpdateWorkingHour {
  id: number;
  gun: string;
  acilis_saati: string;
  kapanis_saati: string;
  dukkan_id: number;
}

export const useWorkingHoursMutation = () => {
  const queryClient = useQueryClient();

  const createWorkingHour = useMutation({
    mutationFn: async (newWorkingHour: Omit<CalismaSaati, "id">) => {
      return calismaSaatleriServisi.ekle(newWorkingHour);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] });
      toast.success("Çalışma saati başarıyla oluşturuldu");
    },
    onError: (error: any) => {
      toast.error(
        `Çalışma saati oluşturulurken bir hata oluştu: ${
          error.message || "Bilinmeyen hata"
        }`
      );
    },
  });

  const deleteWorkingHour = useMutation({
    mutationFn: async (id: number) => {
      return calismaSaatleriServisi.sil(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] });
      toast.success("Çalışma saati başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(
        `Çalışma saati silinirken bir hata oluştu: ${
          error.message || "Bilinmeyen hata"
        }`
      );
    },
  });

  const updateSingleWorkingHour = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<CalismaSaati>;
    }) => {
      // Use guncelle instead of tekGuncelle since that's the available method
      return calismaSaatleriServisi.guncelle([{ ...updates, id }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] });
      toast.success("Çalışma saati başarıyla güncellendi");
    },
    onError: (error: any) => {
      toast.error(
        `Çalışma saati güncellenirken bir hata oluştu: ${
          error.message || "Bilinmeyen hata"
        }`
      );
    },
  });

  return {
    createWorkingHour,
    deleteWorkingHour,
    updateSingleWorkingHour,
  };
};
