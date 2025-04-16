
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { personelServisi } from '@/lib/supabase';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { userService } from "@/lib/auth/services/userService";
import { Personel } from "@/lib/supabase/types";

interface UpdatePersonelParams {
  id: number;
  updates: Partial<Personel>;
}

export const usePersonelMutation = () => {
  const queryClient = useQueryClient();

  const createPersonelMutation = useMutation({
    mutationFn: (personel: Omit<Personel, "id" | "created_at">) => personelServisi.ekle(personel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success('Personel başarıyla oluşturuldu!');
    },
    onError: (error: any) => {
      toast.error(`Personel oluşturulurken bir hata oluştu: ${error.message}`);
    },
  });

  const updatePersonelMutation = useMutation({
    mutationFn: ({ id, updates }: UpdatePersonelParams) => personelServisi.guncelle(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success('Personel başarıyla güncellendi!');
    },
    onError: (error: any) => {
      toast.error(`Personel güncellenirken bir hata oluştu: ${error.message}`);
    },
  });

  const deletePersonelMutation = useMutation({
    mutationFn: (id: number) => personelServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success('Personel başarıyla silindi!');
    },
    onError: (error: any) => {
      toast.error(`Personel silinirken bir hata oluştu: ${error.message}`);
    },
  });
  
  const deleteUserAndPersonelMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        // Önce userService.deleteUserByEmail fonksiyonunu kullanarak kullanıcıyı sil
        await userService.deleteUserByEmail(email);
        return { success: true, message: 'Kullanıcı ve personel başarıyla silindi.' };
      } catch (error: any) {
        console.error("Kullanıcı silme hatası:", error);
        return { success: false, message: `Kullanıcı silinirken bir hata oluştu: ${error.message}` };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Kullanıcı ve personel başarıyla silindi!');
    },
    onError: (error: any) => {
      toast.error(`Kullanıcı veya personel silinirken bir hata oluştu: ${error.message}`);
    },
  });

  return {
    createPersonel: createPersonelMutation.mutate,
    updatePersonel: updatePersonelMutation.mutate,
    deletePersonel: deletePersonelMutation.mutate,
    deleteUserAndPersonel: deleteUserAndPersonelMutation.mutate,
    isCreateLoading: createPersonelMutation.isPending,
    isUpdateLoading: updatePersonelMutation.isPending,
    isDeleteLoading: deletePersonelMutation.isPending,
    isDeleteUserLoading: deleteUserAndPersonelMutation.isPending,
  };
};
