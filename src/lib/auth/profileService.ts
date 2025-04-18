
import { supabase } from "../supabase/client";
import { Profil } from "@/lib/supabase/types";

// Function to get the user profile
export const getProfileData = async (userId: string): Promise<Profil | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

// Add getUserNameWithTitle function
export const getUserNameWithTitle = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Değerli Müşterimiz";

    // Use user metadata first (more reliable and faster)
    const metadata = user.user_metadata;
    if (metadata?.first_name || metadata?.last_name) {
      const title = metadata.gender === 'erkek' ? 'Bay' : 
                   metadata.gender === 'kadın' ? 'Bayan' : '';
      
      const firstName = metadata.first_name || '';
      const lastName = metadata.last_name || '';
      
      if (firstName || lastName) {
        return `${title} ${firstName} ${lastName}`.trim();
      }
    }

    // As a fallback, try to get from profiles table
    const profile = await getProfileData(user.id);
    if (!profile) return "Değerli Müşterimiz";

    const title = profile.gender === 'erkek' ? 'Bay' : 
                 profile.gender === 'kadın' ? 'Bayan' : '';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    if (!firstName && !lastName) return "Değerli Müşterimiz";
    
    return `${title} ${firstName} ${lastName}`.trim();
  } catch (error) {
    console.error("Error getting user name with title:", error);
    return "Değerli Müşterimiz";
  }
};

// Use the security definer function to get user role
export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Try to get role from user metadata first (faster and doesn't trigger RLS)
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }

    // Call the edge function as a fallback (avoid RLS issues)
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: {
        action: 'getUserRole',
        email: user.email
      }
    });

    if (error) {
      console.error("Error getting user role:", error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Export as profileService object for backward compatibility
export const profileService = {
  getProfileData,
  getUserNameWithTitle,
  getUserRole
};
