
import { supabase } from "../../client";
import { Profil } from "../../types";

export const createProfile = async (
  profileData: Partial<Profil>
): Promise<Profil | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating profile:", error);
    return null;
  }
};
