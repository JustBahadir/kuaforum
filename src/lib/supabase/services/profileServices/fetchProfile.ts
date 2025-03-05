
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
    
    // First, try to get profile directly from admin client which bypasses RLS
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, gender, birthdate, role, created_at')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        // Add avatar_url from user metadata if not in profile
        const avatar_url = user.user_metadata?.avatar_url || '';
        return {
          ...data,
          avatar_url: avatar_url
        };
      }
      
      console.warn("Profile not found or error, using metadata:", error);
    } catch (err) {
      console.error("Error in profile fetch with admin client:", err);
    }
    
    // Fallback to user metadata as profile data
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
    console.error("Error in getProfile function:", err);
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
      console.error("Could not get user for role:", userError);
      return null;
    }
    
    // First try to get role from user metadata
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // Try to get role directly with admin client
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!error && data?.role) {
        return data.role;
      }
      
      console.warn("Role not found in profile, using default:", error);
    } catch (err) {
      console.error("Error in role fetch with admin client:", err);
    }
    
    return 'customer'; // Default role
  } catch (err) {
    console.error("Error in getUserRole function:", err);
    return null;
  }
}
