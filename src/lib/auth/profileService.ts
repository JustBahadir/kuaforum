
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { getGenderTitle } from "@/lib/supabase/services/profileServices/profileTypes";
import { supabase } from "@/lib/supabase/client";

/**
 * Service to handle user profile operations
 */
export const profileService = {
  /**
   * Get the user's name with proper title
   */
  getUserNameWithTitle: async (): Promise<string> => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      
      if (!user) {
        return "Değerli Müşterimiz";
      }
      
      // First try to get name from user metadata
      if (user.user_metadata && (user.user_metadata.first_name)) {
        const metaFirstName = user.user_metadata.first_name || '';
        const metaGender = user.user_metadata.gender || '';
        
        const genderTitle = getGenderTitle(metaGender);
        
        if (metaFirstName && genderTitle) {
          return `${metaFirstName} ${genderTitle}`;
        } else if (metaFirstName) {
          return metaFirstName;
        }
      }
      
      // If metadata doesn't have the name, try from profile table
      try {
        const profile = await profilServisi.getir();
        if (profile) {
          const firstName = profile.first_name || "";
          const genderTitle = getGenderTitle(profile.gender);
          
          if (firstName && genderTitle) {
            return `${firstName} ${genderTitle}`;
          } else if (firstName) {
            return firstName;
          } else {
            return "Değerli Müşterimiz";
          }
        } else {
          return "Değerli Müşterimiz";
        }
      } catch (profileError) {
        console.error("Error getting profile:", profileError);
        return "Değerli Müşterimiz";
      }
    } catch (error) {
      console.error("Error getting user name:", error);
      return "Değerli Müşterimiz";
    }
  },

  /**
   * Get the user's shop ID if they are an admin
   */
  getUserShopId: async (userId: string, role: string): Promise<number | null> => {
    if (role === 'admin') {
      try {
        const dukkan = await dukkanServisi.kullanicininDukkani(userId);
        if (dukkan) {
          return dukkan.id;
        }
      } catch (error) {
        console.error("Dükkan bilgisi alınamadı:", error);
      }
    }
    return null;
  },

  /**
   * Get the user's role
   */
  getUserRole: async (): Promise<string | null> => {
    return await profilServisi.getUserRole();
  }
};
