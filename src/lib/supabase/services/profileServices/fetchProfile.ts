
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

// Add the missing getUserRole function
export const getUserRole = async (userId?: string): Promise<string | null> => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (!userId) return null;
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
      
    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

// Add getUserNameWithTitle function
export const getUserNameWithTitle = async (): Promise<string> => {
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
};
