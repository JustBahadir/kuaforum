
import { supabase } from "../supabase/client";
import { User } from "@supabase/supabase-js";
import { Profil } from "../supabase/types";

export const profileService = {
  async getProfile(user: User | null): Promise<Profil | null> {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getProfile:", error);
      return null;
    }
  },
  
  async updateProfile(userId: string, updates: Partial<Profil>): Promise<Profil | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return null;
    }
  }
};
