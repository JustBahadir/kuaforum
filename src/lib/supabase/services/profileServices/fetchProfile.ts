
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
      // Retry mechanism for Supabase connection issues
      let retryCount = 0;
      let profileData = null;
      let profileError = null;
      
      while (retryCount < 3 && !profileData) {
        try {
          // Get profile with admin client to bypass RLS
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
          console.error(`Profile fetch attempt ${retryCount + 1} failed:`, error);
          
          // Try to refresh session for API key errors
          if (error.message?.includes('Invalid API key')) {
            try {
              await supabase.auth.refreshSession();
              console.log("Session refreshed");
            } catch (refreshError) {
              console.error("Session refresh error:", refreshError);
            }
          }
          
          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (tryError) {
          console.error("Try-catch profile fetch error:", tryError);
          profileError = tryError;
          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // If still no profile data, use user metadata as fallback
      if (!profileData) {
        console.error("Profile data could not be fetched, using metadata:", profileError);
        
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
      console.error("Error in profile fetch process:", err);
      
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
    
    // Retry mechanism for Supabase connection issues
    let retryCount = 0;
    let roleData = null;
    let roleError = null;
    
    while (retryCount < 3 && roleData === null) {
      try {
        // Query profile directly with admin client
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
        console.error(`Role fetch attempt ${retryCount + 1} failed:`, error);
        
        // Try to refresh session for API key errors
        if (error.message?.includes('Invalid API key')) {
          try {
            await supabase.auth.refreshSession();
            console.log("Session refreshed");
          } catch (refreshError) {
            console.error("Session refresh error:", refreshError);
          }
        }
        
        retryCount++;
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (tryError) {
        console.error("Try-catch role fetch error:", tryError);
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
    
    console.error("Role could not be fetched, using default 'customer':", roleError);
    return 'customer';
  } catch (err) {
    console.error("Error in getUserRole function:", err);
    return null;
  }
}
