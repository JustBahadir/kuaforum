
import { supabase } from '../../client';
import { Profile } from '../../types';

/**
 * Fetches the current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return null;
    }
    
    try {
      // Get the profile from the database with simplified query to avoid RLS recursion
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, gender, birthdate, role, created_at')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        // If we still get recursion error, try using the admin client or service role
        console.error("Error fetching profile with normal query:", error);
        
        // Try a simpler query as a workaround
        if (error.code === '42P17') {
          console.log("Detected recursion error, trying simpler query approach");
          return {
            id: user.id,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            role: user.user_metadata?.role || 'customer',
            phone: user.user_metadata?.phone || '',
            gender: user.user_metadata?.gender || '',
            birthdate: user.user_metadata?.birthdate || null,
            created_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      // If profile is null, create a default one from user metadata
      if (!profile) {
        return {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'customer',
          phone: user.user_metadata?.phone || '',
          gender: user.user_metadata?.gender || '',
          birthdate: user.user_metadata?.birthdate || null,
          created_at: new Date().toISOString()
        };
      }
      
      return profile;
    } catch (err) {
      console.error("Exception in profile fetch:", err);
      
      // Fallback to user_metadata if available
      return {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'customer',
        phone: user.user_metadata?.phone || '',
        gender: user.user_metadata?.gender || '',
        birthdate: user.user_metadata?.birthdate || null,
        created_at: new Date().toISOString()
      };
    }
  } catch (err) {
    console.error("Exception in getProfile:", err);
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
      console.error("Error getting user for role:", userError);
      return null;
    }
    
    // First try to get role from user metadata
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // If not in metadata, try to get from profile
    const profile = await getProfile();
    return profile?.role || 'customer';
  } catch (err) {
    console.error("Error in getUserRole:", err);
    return null;
  }
}
