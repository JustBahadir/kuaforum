
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Service to handle authentication-related operations
 */
export const authService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Auth error:", error);
      throw error;
    }
    return data.user;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
      return true;
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
      throw error;
    }
  },

  /**
   * Set up an auth state change listener
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "has session" : "no session");
      callback(event, session);
    });
    
    return data.subscription;
  }
};
