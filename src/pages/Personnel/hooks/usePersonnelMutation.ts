
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Personel, supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

        // Check if the user already exists in auth but not in personel table
        const { data: existingAuth, error: existingAuthError } = await supabase.auth
          .signInWithPassword({
            email: data.eposta,
            password: 'password123'
          })
          .catch(e => {
            console.log("Auth check error (this is expected if user doesn't exist):", e.message);
            return { data: null, error: e };
          });

        // If user exists in auth but not in personel table
        if (existingAuth?.user) {
          console.log("User exists in auth but not in personel table. User:", existingAuth.user);
          
          const personelData = {
            ...data,
            auth_id: existingAuth.user.id,
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
        }

        // Create new auth user if not exists
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.eposta,
          password: 'password123',
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

          // In case the user exists but we get an error like "already registered"
          if (authError.message.includes('already registered')) {
            // Try to find the user in profiles table
            const { data: findUserData, error: findUserError } = await supabase
              .from('profiles')
              .select('id')
              .filter('first_name', 'ilike', data.ad_soyad.split(' ')[0])
              .filter('last_name', 'ilike', data.ad_soyad.split(' ').slice(1).join(' '))
              .maybeSingle();

            if (findUserError || !findUserData) {
              throw new Error('Bu e-posta adresi zaten kayıtlı, ancak personel kaydı yapılamadı. Lütfen sistem yöneticisine başvurun.');
            }

            const personelData = {
              ...data,
              auth_id: findUserData.id,
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
          if (authData.user) {
            try {
              console.log("Would delete user", authData.user.id);
              // Uncomment to actually delete the user if personel creation fails
              // await supabase.auth.admin.deleteUser(authData.user.id);
            } catch (deleteError) {
              console.error("Could not delete auth user:", deleteError);
            }
          }
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
