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
