
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
  },
  
  // Add missing functions to match imports in other files
  async getUserRole(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data?.role || null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  },
  
  async getUserNameWithTitle(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "Değerli Müşterimiz";
      
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, gender")
        .eq("id", user.id)
        .maybeSingle();
      
      if (!data) return "Değerli Müşterimiz";
      
      const title = data.gender === 'erkek' ? 'Bay' : 
                    data.gender === 'kadın' ? 'Bayan' : '';
      
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      
      if (!firstName && !lastName) return "Değerli Müşterimiz";
      
      return `${title} ${firstName} ${lastName}`.trim();
    } catch (error) {
      console.error("Error getting user name with title:", error);
      return "Değerli Müşterimiz";
    }
  }
};
