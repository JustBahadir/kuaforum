
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Personel } from "@/lib/supabase";
import { toast } from "sonner";

export function usePersonnelMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personelData: Omit<Personel, 'id' | 'created_at'>) => {
      // Personel kaydını oluştur
      const { data, error } = await supabase
        .from('personel')
        .insert([personelData])
        .select()
        .single();

      if (error) throw error;

      // Eğer auth_id belirtilmişse, personel ekleme işlemine gerek yok
      if (personelData.auth_id) return data;

      try {
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
          
          // Eğer bu e-posta ile bir kullanıcı zaten varsa, bulup personel ile ilişkilendir
          const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
          
          if (!listError && usersData && usersData.users) {
            // TypeScript hatalarını önlemek için güvenli şekilde tipleme
            const users = usersData.users as Array<{
              id?: string;
              email?: string;
            }>;
            
            // Kullanıcıları güvenli bir şekilde filtrele ve doğru kullanıcıyı bul
            const matchingUser = users.find(user => {
              return user && 
                     typeof user === 'object' && 
                     'email' in user && 
                     typeof user.email === 'string' && 
                     user.email === personelData.eposta;
            });
            
            if (matchingUser && matchingUser.id) {
              // Bulunan kullanıcı ile personeli ilişkilendir
              const { error: updateError } = await supabase
                .from('personel')
                .update({ auth_id: matchingUser.id })
                .eq('id', data.id);
                
              if (updateError) throw updateError;
              
              // Kullanıcının rolünü personel olarak güncelle
              await supabase.auth.admin.updateUserById(matchingUser.id, {
                user_metadata: { role: 'staff' }
              });
              
              // Kullanıcı profilini güncelle
              await supabase
                .from('profiles')
                .upsert({
                  id: matchingUser.id,
                  first_name: personelData.ad_soyad.split(' ')[0] || '',
                  last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || '',
                  role: 'staff'
                });
            } else {
              throw new Error("Matching user not found");
            }
          } else {
            throw authError;
          }
        } else if (authData && authData.user) {
          // Yeni oluşturulan auth kullanıcısını personel ile ilişkilendir
          const { error: updateError } = await supabase
            .from('personel')
            .update({ auth_id: authData.user.id })
            .eq('id', data.id);
            
          if (updateError) throw updateError;
          
          // Kullanıcı profilini oluştur veya güncelle
          await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              first_name: personelData.ad_soyad.split(' ')[0] || '',
              last_name: personelData.ad_soyad.split(' ').slice(1).join(' ') || '',
              role: 'staff'
            });
        }
      } catch (error) {
        console.error("Error linking personnel to auth user:", error);
        // Bu hata durumunda personel kaydedilmiş olacak, sadece auth bağlantısı eksik kalacak
        // Bu hatayı göster ama işlemi iptal etme
        toast.error("Personel kaydedildi ancak giriş bilgileri oluşturulamadı");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Personel başarıyla eklendi");
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Personel ekleme hatası:", error);
      toast.error("Personel eklenirken bir hata oluştu: " + error.message);
    }
  });
}
