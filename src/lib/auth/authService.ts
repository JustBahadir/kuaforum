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
      return null;
    }
    return data.user;
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
   * Set up an auth state change listener
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "has session" : "no session");
      callback(event, session);
    });
    
    return data.subscription;
  },

  /**
   * Create a unique shop code based on shop name
   */
  generateShopCode: (shopName: string) => {
    const normalizedName = shopName
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${normalizedName}-${randomSuffix}`;
  },

  /**
   * Verify if a shop code exists
   */
  verifyShopCode: async (shopCode: string) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('id, ad')
      .eq('kod', shopCode)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  },
  
  /**
   * Find a user by email address
   */
  findUserByEmail: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error("Error listing users:", error);
        return null;
      }
      
      const user = data?.users?.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      return user || null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  },
};
