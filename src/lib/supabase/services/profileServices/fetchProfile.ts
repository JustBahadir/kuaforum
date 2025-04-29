
import { supabase } from "../../client";
import { Profil } from "../../types";

export const fetchProfile = async (userId: string): Promise<Profil | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};
