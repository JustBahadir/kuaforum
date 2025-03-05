
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
      // Admin istemcisi ile profil getir, RLS bypass
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, gender, birthdate, role, created_at')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Profil bilgileri alınamadı:", error);
        
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
      
      // If profile is null, create a default one from user metadata
      if (!profile) {
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
        ...profile,
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
    
    // Admin istemcisi ile profili doğrudan sorgula
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Role bilgisi alınamadı:", error);
        return 'customer'; // Varsayılan değer
      }
      
      return data?.role || 'customer';
    } catch (rpcError) {
      console.error("getUserRole sorgu hatası:", rpcError);
      return 'customer';
    }
  } catch (err) {
    console.error("getUserRole fonksiyonunda hata:", err);
    return null;
  }
}
