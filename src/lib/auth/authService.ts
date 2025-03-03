
import { supabase } from '@/lib/supabase/client';
import { shopService } from './services/shopService';

export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error("Sign in error:", error.message);
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
        console.error("Sign up error:", error.message);
        return { user: null, error };
      }
      
      console.log("Sign up successful:", data.user);
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      return { user: null, error };
    }
  },
  
  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      throw error;
    }
  },
  
  /**
   * Get the current user
   */
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error: any) {
      console.error("Get current user error:", error.message);
      return null;
    }
  },
  
  /**
   * Listen for auth state changes
   */
  onAuthStateChange: (callback: Function) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
  
  /**
   * Generate a shop code
   */
  generateShopCode: (shopName: string) => {
    return shopService.generateShopCode(shopName);
  },
  
  /**
   * Verify a shop code
   */
  verifyShopCode: async (shopCode: string) => {
    return await shopService.verifyShopCode(shopCode);
  }
};
