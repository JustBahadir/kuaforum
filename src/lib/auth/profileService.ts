
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

// Add getUserRole function to fix the missing method error
export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await getProfileData(user.id);
    return profile?.role || null;
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
