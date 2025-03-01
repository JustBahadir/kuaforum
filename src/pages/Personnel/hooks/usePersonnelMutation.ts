
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

        // Try to fetch auth user by email without using search parameter
        // We need to fetch all users and filter on the client side since the API doesn't support searching by email
        const { data: authData, error: userFetchError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 100 // Fetch more to increase the chance of finding the user
        });
        
        let authId = null;
        let foundUser = null;
        
        // Filter users on the client side with proper type checking
        if (authData?.users) {
          // Use a type assertion to help TypeScript understand what we're working with
          const users = authData.users;
          
          // Find user with matching email using proper type checking
          foundUser = users.find(user => {
            if (user && typeof user === 'object' && user !== null) {
              // Check if the email property exists on the user object
              if ('email' in user && typeof user.email === 'string') {
                return user.email.toLowerCase() === data.eposta.toLowerCase();
              }
            }
            return false;
          });
          
          if (foundUser && 'id' in foundUser) {
            console.log("User exists in auth system:", foundUser);
            authId = foundUser.id;
            
            // Update user role to staff
            await profilServisi.createOrUpdateProfile(authId, {
              role: 'staff'
            });
          }
        }

        // If user doesn't exist, create a new one
        if (!authId) {
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
