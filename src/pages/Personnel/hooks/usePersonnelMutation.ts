
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Personel } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { User } from "@supabase/supabase-js";

export function usePersonnelMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personelData: Omit<Personel, 'id' | 'created_at'>) => {
      console.log("Personnel mutation started with data:", personelData);
      
      // Personel kaydını oluştur
      const { data, error } = await supabase
        .from('personel')
        .insert([personelData])
        .select()
        .single();

      if (error) {
        console.error("Personnel insert error:", error);
        throw error;
      }

      console.log("Personnel record created:", data);

      // Eğer auth_id belirtilmişse, additional auth steps are optional
      if (personelData.auth_id) {
        try {
          // Get user information
          const { data: userResponse } = await supabase.auth.getUser(personelData.auth_id);
          const userData = userResponse?.user;
          
          if (userData) {
            console.log("Found existing user:", userData.id);
            
            // Update user metadata
            await supabase.auth.admin.updateUserById(personelData.auth_id, {
              user_metadata: { 
                role: 'staff',
                first_name: personelData.ad_soyad.split(' ')[0] || '',
                last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || ''
              }
            });
            
            // Update profile
            await profilServisi.createOrUpdateProfile(personelData.auth_id, {
              first_name: personelData.ad_soyad.split(' ')[0] || '',
              last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || '',
              role: 'staff',
              phone: personelData.telefon
            });
            
            console.log("Updated existing user profile");
          }
        } catch (error) {
          console.error("Error updating profile for existing auth user:", error);
        }
        
        return data;
      }

      try {
        // Try to find if a user with this email already exists
        const findExistingUser = async (email: string): Promise<User | null> => {
          try {
            // First try simple sign in if the user exists
            const { data: signInResult, error: signInError } = await supabase.auth.signInWithPassword({
              email: email,
              password: "password123"
            });
            
            if (!signInError && signInResult?.user) {
              return signInResult.user;
            }
            
            // If sign in failed, try to find the user through admin API
            const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
            
            if (listError || !usersData?.users) {
              console.error("Error listing users:", listError);
              return null;
            }
            
            const matchingUser = usersData.users.find(user => 
              user && user.email === email
            );
            
            return matchingUser || null;
          } catch (error) {
            console.error("Error finding existing user:", error);
            return null;
          }
        };
        
        // Find existing user or create new one
        const existingUser = await findExistingUser(personelData.eposta);
        
        if (existingUser) {
          console.log("User already exists:", existingUser.id);
          
          // Update auth metadata
          await supabase.auth.admin.updateUserById(existingUser.id, {
            user_metadata: { 
              role: 'staff',
              first_name: personelData.ad_soyad.split(' ')[0] || '',
              last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || ''
            }
          });
          
          // Update profile
          await profilServisi.createOrUpdateProfile(existingUser.id, {
            first_name: personelData.ad_soyad.split(' ')[0] || '',
            last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || '',
            role: 'staff',
            phone: personelData.telefon
          });
          
          // Update personnel record with auth_id
          await supabase
            .from('personel')
            .update({ auth_id: existingUser.id })
            .eq('id', data.id);
          
          // Sign out after the operation
          await supabase.auth.signOut();
          
          return data;
        }
        
        // User doesn't exist, create new user
        console.log("Creating new auth user for personnel");
        
        // Auth kullanıcısı oluştur
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: personelData.eposta,
          password: "password123",
          email_confirm: true,
          user_metadata: {
            first_name: personelData.ad_soyad.split(' ')[0] || '',
            last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || '',
            role: 'staff'
          }
        });

        if (authError) {
          console.error("Auth user creation error:", authError);
          // If we couldn't create a user, return the personnel record anyway
          console.log("Continuing without auth user connection");
          return data;
        }

        // Successfully created auth user, now connect it
        if (authData && authData.user) {
          console.log("New auth user created:", authData.user.id);
          
          // Update personnel record with auth_id
          await supabase
            .from('personel')
            .update({ auth_id: authData.user.id })
            .eq('id', data.id);
            
          // Create profile
          await profilServisi.createOrUpdateProfile(authData.user.id, {
            first_name: personelData.ad_soyad.split(' ')[0] || '',
            last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || '',
            role: 'staff',
            phone: personelData.telefon
          });
        }
      } catch (error) {
        console.error("Error linking personnel to auth user:", error);
        // This error will not stop the process as personnel record is still created
        toast({
          title: "Hata",
          description: "Personel kaydedildi ancak giriş bilgileri oluşturulamadı"
        });
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Personel başarıyla eklendi"
      });
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Personel ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Personel eklenirken bir hata oluştu: " + error.message,
        variant: "destructive"
      });
    }
  });
}
