import { useMutation, useQueryClient } from '@tanstack/react-query';
import { personelServisi } from '@/lib/supabase';
import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UpdatePersonelParams {
  id: number;
  updates: Partial<Personel>;
}

export const usePersonelMutation = () => {
  const queryClient = useQueryClient();

  const createPersonelMutation = useMutation(
    personelServisi.ekle,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['personel']);
        toast.success('Personel başarıyla oluşturuldu!');
      },
      onError: (error: any) => {
        toast.error(`Personel oluşturulurken bir hata oluştu: ${error.message}`);
      },
    }
  );

  const updatePersonelMutation = useMutation(
    ({ id, updates }: UpdatePersonelParams) => personelServisi.guncelle(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['personel']);
        toast.success('Personel başarıyla güncellendi!');
      },
      onError: (error: any) => {
        toast.error(`Personel güncellenirken bir hata oluştu: ${error.message}`);
      },
    }
  );

  const deletePersonelMutation = useMutation(
    personelServisi.sil,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['personel']);
        toast.success('Personel başarıyla silindi!');
      },
      onError: (error: any) => {
        toast.error(`Personel silinirken bir hata oluştu: ${error.message}`);
      },
    }
  );
  
  const deleteUserAndPersonelMutation = useMutation(
    async (email: string) => {
      try {
        // Önce userService.deleteUserByEmail fonksiyonunu kullanarak kullanıcıyı sil
        await userService.deleteUserByEmail(email);
        return { success: true, message: 'Kullanıcı ve personel başarıyla silindi.' };
      } catch (error: any) {
        console.error("Kullanıcı silme hatası:", error);
        return { success: false, message: `Kullanıcı silinirken bir hata oluştu: ${error.message}` };
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['personnel']);
        toast.success('Kullanıcı ve personel başarıyla silindi!');
      },
      onError: (error: any) => {
        toast.error(`Kullanıcı veya personel silinirken bir hata oluştu: ${error.message}`);
      },
    }
  );

  return {
    createPersonel: createPersonelMutation.mutate,
    updatePersonel: updatePersonelMutation.mutate,
    deletePersonel: deletePersonelMutation.mutate,
    deleteUserAndPersonel: deleteUserAndPersonelMutation.mutate,
    isCreateLoading: createPersonelMutation.isLoading,
    isUpdateLoading: updatePersonelMutation.isLoading,
    isDeleteLoading: deletePersonelMutation.isLoading,
    isDeleteUserLoading: deleteUserAndPersonelMutation.isLoading,
  };
};

import { userService } from "@/lib/auth/services/userService";
import { Personel } from "@/lib/supabase/types";
