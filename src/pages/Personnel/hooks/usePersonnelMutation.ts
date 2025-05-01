
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { toast } from "sonner";

interface PersonnelMutationProps {
  onSuccess?: () => void;
}

export function usePersonnelMutation({ onSuccess }: PersonnelMutationProps = {}) {
  const queryClient = useQueryClient();

  const createPersonnel = useMutation({
    mutationFn: async (personnelData: any) => {
      return await personelServisi.ekle(personnelData);
    },
    onSuccess: () => {
      toast.success("Personel başarıyla eklendi");
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("Personnel creation error:", error);
      toast.error(
        error.message || "Personel eklenirken bir hata oluştu"
      );
    },
  });

  const updatePersonnel = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await personelServisi.guncelle(id, data);
    },
    onSuccess: () => {
      toast.success("Personel başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("Personnel update error:", error);
      toast.error(
        error.message || "Personel güncellenirken bir hata oluştu"
      );
    },
  });

  const deletePersonnel = useMutation({
    mutationFn: async (id: number) => {
      return await personelServisi.sil(id);
    },
    onSuccess: () => {
      toast.success("Personel başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("Personnel deletion error:", error);
      toast.error(
        error.message || "Personel silinirken bir hata oluştu"
      );
    },
  });

  return {
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
  };
}
