
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Service to handle authentication-related operations
 */
export const authenticationService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Giriş hatası:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Giriş yapılırken hata:", error);
      throw error;
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        console.error("Kayıt hatası:", error);
        return { user: null, error };
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Kayıt yapılırken hata:", error);
      return { user: null, error };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Çıkış yapılırken hata:", error);
        toast.error("Çıkış yapılırken bir hata oluştu");
        throw error;
      }
      toast.success("Başarıyla çıkış yapıldı");
      console.log("Çıkış başarılı");
      return true;
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
      throw error;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/staff-login`,
      });
      
      if (error) {
        console.error("Şifre sıfırlama hatası:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Şifre sıfırlarken hata:", error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Oturum bilgisi alınırken hata:", error);
      return null;
    }
    return data.session;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Kullanıcı bilgisi alınırken hata:", error);
      return null;
    }
    return data.user;
  }
};
