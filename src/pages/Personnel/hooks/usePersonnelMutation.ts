
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Personel, supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function usePersonnelMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Personel, 'id' | 'created_at'>) => {
      try {
        const { data: existingUser } = await supabase
          .from('personel')
          .select('eposta')
          .eq('eposta', data.eposta)
          .single();

        if (existingUser) {
          throw new Error('Bu e-posta adresi ile kayıtlı personel bulunmaktadır');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.eposta,
          password: 'password123', // Longer password that meets the minimum requirements
          options: {
            data: {
              first_name: data.ad_soyad.split(' ')[0],
              last_name: data.ad_soyad.split(' ').slice(1).join(' '),
              role: 'staff'
            }
          }
        });

        if (authError) {
          console.error('Auth Error:', authError);
          if (authError.message.includes('already registered')) {
            throw new Error('Bu e-posta adresi zaten kayıtlı');
          }
          throw authError;
        }

        if (!authData.user) {
          throw new Error('Kullanıcı kaydı oluşturulamadı');
        }

        const personelData = {
          ...data,
          auth_id: authData.user.id,
          personel_no: `P${Math.floor(Math.random() * 10000)}`
        };

        const { data: personel, error: personelError } = await supabase
          .from('personel')
          .insert([personelData])
          .select()
          .single();

        if (personelError) {
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Personel kaydı oluşturulurken bir hata oluştu');
        }

        return personel;
      } catch (error: any) {
        console.error('Error:', error);
        throw new Error(error.message || 'Personel kaydı sırasında bir hata oluştu');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success('Personel başarıyla eklendi');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    }
  });
}
