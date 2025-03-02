
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
    
    // Get the profile from the database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return profile;
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
    const profile = await getProfile();
    return profile?.role || null;
  } catch (err) {
    console.error("Error in getUserRole:", err);
    return null;
  }
}
