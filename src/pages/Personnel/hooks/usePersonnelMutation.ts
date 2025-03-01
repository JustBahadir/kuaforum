
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Personel, supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

export function usePersonnelMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Personel, 'id' | 'created_at'>) => {
      try {
        // Check if a personel with this email already exists
        const { data: existingUser, error: existingUserError } = await supabase
          .from('personel')
          .select('eposta, auth_id')
          .eq('eposta', data.eposta)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Bu e-posta adresi ile kayıtlı personel bulunmaktadır');
        }

        // Try to fetch auth user by email 
        // Instead of using filters which doesn't exist, use search term on the email field
        const { data: authData, error: userFetchError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1,
          search: data.eposta
        });
        
        let authId = null;
        const users = authData?.users || [];

        // If user exists in auth
        if (users && users.length > 0) {
          console.log("User exists in auth system:", users[0]);
          authId = users[0].id;
          
          // Update user role to staff
          await profilServisi.createOrUpdateProfile(authId, {
            role: 'staff'
          });
        } else {
          // Create new auth user if not exists
          const randomPassword = `Password${Math.floor(Math.random() * 100000)}`;
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.eposta,
            password: randomPassword,
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
            throw new Error(`Personel hesabı oluşturulurken bir hata oluştu: ${authError.message}`);
          }

          if (!authData.user) {
            throw new Error('Kullanıcı kaydı oluşturulamadı');
          }
          
          authId = authData.user.id;
          
          // Create profile with staff role
          await profilServisi.createOrUpdateProfile(authId, {
            first_name: data.ad_soyad.split(' ')[0],
            last_name: data.ad_soyad.split(' ').slice(1).join(' '),
            role: 'staff'
          });
        }

        // Create personel record with auth_id
        const personelData = {
          ...data,
          auth_id: authId,
          personel_no: `P${Math.floor(Math.random() * 10000)}`
        };

        const { data: personel, error: personelError } = await supabase
          .from('personel')
          .insert([personelData])
          .select()
          .single();

        if (personelError) {
          throw new Error('Personel kaydı oluşturulurken bir hata oluştu: ' + personelError.message);
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
