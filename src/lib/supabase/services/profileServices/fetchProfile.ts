import { supabase } from "../../client";
import { Profil } from "../../types";

/**
 * Mevcut kullanıcının profilini getirir
 */
export async function getProfile(): Promise<Profil | null> {
  try {
    // Mevcut kullanıcıyı al
    let { data: { user }, error: userError } = await supabase.auth.getUser();
    
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
    
    try {
      // Try to get profile directly without RLS policy
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, gender, birthdate, role, created_at, avatar_url, dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        return data as Profil;
      }
      
      console.warn("Profil veritabanından alınamadı, kullanıcı meta verisine dönülüyor:", error);
    } catch (err) {
      console.error("Profil getirme hatası:", err);
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
      dukkan_id: user.user_metadata?.dukkan_id || null,
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
    let { data: { user }, error: userError } = await supabase.auth.getUser();
    
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
    
    // Rolü doğrudan kullanıcı meta verisinden almayı dene
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // Yeterli yetki varsa profiles tablosundan almayı dene
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!error && data?.role) {
        return data.role;
      }
    } catch (err) {
      console.error("Profiles tablosundan rol getirme hatası:", err);
    }
    
    return 'customer'; // Varsayılan rol
  } catch (err) {
    console.error("getUserRole fonksiyonunda hata:", err);
    return null;
  }
}
