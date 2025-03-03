
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
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
      // Define proper type for user data
      interface User {
        id: string;
        email: string;
        // Include other properties as needed
      }
      
      // We need to use supabaseAdmin for this operation
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error("Error listing users:", error);
        return null;
      }
      
      // Properly type the users array
      const users = data?.users as User[] || [];
      
      const user = users.find(user => 
        user.email && user.email.toLowerCase() === email.toLowerCase()
      );
      
      return user || null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  },
  
  /**
   * Delete a user account by email
   */
  deleteUserByEmail: async (email: string) => {
    try {
      // First, find the user by email
      const user = await authService.findUserByEmail(email);
      
      if (!user) {
        throw new Error("Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.");
      }
      
      // Delete the user using supabaseAdmin
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (error) {
        console.error("User deletion error:", error);
        throw error;
      }
      
      // Also clean up related records in the database
      try {
        // Remove from profiles table
        await supabase.from('profiles').delete().eq('id', user.id);
        
        // Try to find and remove personnel records
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id);
          
        if (personelData && personelData.length > 0) {
          await supabase.from('personel').delete().eq('auth_id', user.id);
        }
      } catch (cleanupError) {
        console.error("Related records cleanup error:", cleanupError);
        // We don't throw here as the user is already deleted from auth
      }
      
      return true;
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      throw error;
    }
  },
};
