
import { supabase } from '../../client';
import { Profile } from '../../types';
import { createDefaultProfile } from './createProfile';

/**
 * Retrieves a user's profile from the database
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      // First try to get profile from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // Return basic profile from auth data as fallback
        const role = user.user_metadata?.role || 'customer';
        console.log("Retrieved user role from metadata:", role);
        
        // Try to create this profile in the database
        return await createDefaultProfile(user);
      }
      
      // If profile is null but user exists, create a basic profile
      if (!data) {
        return await createDefaultProfile(user);
      }
      
      return data;
    } catch (error) {
      console.error("Exception in profile fetch:", error);
      // Return basic profile from auth data as fallback
      return {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        role: user.user_metadata?.role || 'customer'
      };
    }
  } catch (error) {
    console.error("Error in getProfile:", error);
    return null;
  }
}

/**
 * Get the role of a specific user
 */
export async function getUserRole(userId: string): Promise<string | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      
      // Try to get role from auth metadata
      try {
        const { data: userResponse } = await supabase.auth.getUser();
        if (userResponse && userResponse.user && userResponse.user.id === userId) {
          return userResponse.user.user_metadata?.role || 'customer';
        }
      } catch (userError) {
        console.error("Error getting user:", userError);
      }
      
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error("Exception in getUserRole:", error);
    return null;
  }
}
