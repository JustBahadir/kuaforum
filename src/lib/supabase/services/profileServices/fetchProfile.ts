
import { supabase, supabaseAdmin } from '../../client';
import { Profile } from '../../types';

/**
 * Mevcut kullanıcının profilini getirir
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    // Mevcut kullanıcıyı al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Kullanıcı bilgisi alınamadı:", userError);
      
      // Oturumu yenilemeyi dene
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Oturum yenileme hatası:", refreshError);
          return null;
        }
        
        if (!data.user) {
          console.error("Yenileme sonrası kullanıcı bulunamadı");
          return null;
        }
        
        // Yenileme başarılı oldu, kullanıcıyı güncelle
        user = data.user;
      } catch (refreshErr) {
        console.error("Oturum yenileme işlemi sırasında hata:", refreshErr);
        return null;
      }
    }
    
    // Önce profili doğrudan admin istemcisinden almayı dene (RLS'yi bypass eder)
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, gender, birthdate, role, created_at')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        // Profilde yoksa avatar_url'i kullanıcı meta verisinden ekle
        const avatar_url = user.user_metadata?.avatar_url || '';
        return {
          ...data,
          avatar_url: avatar_url
        };
      }
      
      console.warn("Profil bulunamadı veya hata, meta veri kullanılıyor:", error);
    } catch (err) {
      console.error("Admin istemci ile profil getirme hatası:", err);
    }
    
    // Profil yoksa veya hata varsa, kullanıcı meta verisini profil verisi olarak kullan
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
  } catch (err) {
    console.error("getProfile fonksiyonunda hata:", err);
    return null;
  }
}

/**
 * Kullanıcı rolünü profilden alır
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Rol için kullanıcı alınamadı:", userError);
      
      // Oturumu yenilemeyi dene
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !data.user) {
          console.error("Rol için oturum yenileme başarısız:", refreshError);
          return null;
        }
        
        // Yenileme başarılı, kullanıcıyı güncelle
        user = data.user;
      } catch (refreshErr) {
        console.error("Rol için oturum yenileme işleminde hata:", refreshErr);
        return null;
      }
    }
    
    // Önce rolü kullanıcı meta verisinden almayı dene
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // Rolü doğrudan admin istemcisi ile almayı dene
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!error && data?.role) {
        return data.role;
      }
      
      console.warn("Profilde rol bulunamadı, varsayılan kullanılıyor:", error);
    } catch (err) {
      console.error("Admin istemci ile rol getirme hatası:", err);
    }
    
    return 'customer'; // Varsayılan rol
  } catch (err) {
    console.error("getUserRole fonksiyonunda hata:", err);
    return null;
  }
}
