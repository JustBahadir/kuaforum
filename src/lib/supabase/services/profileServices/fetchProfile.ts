
import { supabase, supabaseAdmin } from '../../client';
import { Profile } from '../../types';

/**
 * Fetches the current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Kullanıcı bilgisi alınamadı:", userError);
      return null;
    }
    
    try {
      // Supabase bağlantı sorunlarını önlemek için tekrar deneme mekanizması
      let retryCount = 0;
      let profileData = null;
      let profileError = null;
      
      while (retryCount < 3 && !profileData) {
        try {
          // Admin istemcisi ile profil getir, RLS bypass
          const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, first_name, last_name, phone, gender, birthdate, role, created_at')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!error) {
            profileData = data;
            break;
          }
          
          profileError = error;
          console.error(`Profil getirme denemesi ${retryCount + 1} başarısız:`, error);
          
          // API anahtarı hatası için oturumu yenilemeyi dene
          if (error.message?.includes('Invalid API key')) {
            try {
              await supabase.auth.refreshSession();
              console.log("Oturum yenilendi");
            } catch (refreshError) {
              console.error("Oturum yenileme hatası:", refreshError);
            }
          }
          
          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (tryError) {
          console.error("Try-catch profil getirme hatası:", tryError);
          profileError = tryError;
          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Hala hata varsa kullanıcı metadatasını kullan
      if (!profileData) {
        console.error("Profil bilgileri alınamadı, metadata kullanılıyor:", profileError);
        
        // Use user metadata as fallback
        const avatar_url = user.user_metadata?.avatar_url || '';
        
        return {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'customer',
          phone: user.user_metadata?.phone || '',
          gender: user.user_metadata?.gender || '',
          birthdate: user.user_metadata?.birthdate || null,
          avatar_url: avatar_url,
          created_at: new Date().toISOString()
        };
      }
      
      // Add avatar_url from user metadata if not in profile
      const avatar_url = user.user_metadata?.avatar_url || '';
      return {
        ...profileData,
        avatar_url: avatar_url
      };
    } catch (err) {
      console.error("Profil getirme işleminde hata:", err);
      
      // Fallback to user_metadata if available
      const avatar_url = user.user_metadata?.avatar_url || '';
      
      return {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'customer',
        phone: user.user_metadata?.phone || '',
        gender: user.user_metadata?.gender || '',
        birthdate: user.user_metadata?.birthdate || null,
        avatar_url: avatar_url,
        created_at: new Date().toISOString()
      };
    }
  } catch (err) {
    console.error("getProfile fonksiyonunda hata:", err);
    return null;
  }
}

/**
 * Gets the user role from the profile
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Rol için kullanıcı bilgisi alınamadı:", userError);
      return null;
    }
    
    // Önce user metadata'dan role almayı deneyelim
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // Supabase bağlantı sorunlarını önlemek için tekrar deneme mekanizması
    let retryCount = 0;
    let roleData = null;
    let roleError = null;
    
    while (retryCount < 3 && roleData === null) {
      try {
        // Admin istemcisi ile profili doğrudan sorgula
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!error) {
          roleData = data?.role || 'customer';
          break;
        }
        
        roleError = error;
        console.error(`Rol getirme denemesi ${retryCount + 1} başarısız:`, error);
        
        // API anahtarı hatası için oturumu yenilemeyi dene
        if (error.message?.includes('Invalid API key')) {
          try {
            await supabase.auth.refreshSession();
            console.log("Oturum yenilendi");
          } catch (refreshError) {
            console.error("Oturum yenileme hatası:", refreshError);
          }
        }
        
        retryCount++;
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (tryError) {
        console.error("Try-catch rol getirme hatası:", tryError);
        roleError = tryError;
        retryCount++;
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (roleData !== null) {
      return roleData;
    }
    
    console.error("Rol bilgisi alınamadı, varsayılan 'customer' kullanılıyor:", roleError);
    return 'customer';
  } catch (err) {
    console.error("getUserRole fonksiyonunda hata:", err);
    return null;
  }
}
