
import { authenticationService } from './services/authenticationService';
import { shopService } from './services/shopService';
import { supabase } from "@/lib/supabase/client";

/**
 * Service to handle authentication-related operations
 */
export const authService = {
  // Authentication operations
  signIn: authenticationService.signIn,
  signUp: authenticationService.signUp,
  signOut: authenticationService.signOut,
  resetPassword: authenticationService.resetPassword,
  getSession: authenticationService.getSession,
  getCurrentUser: authenticationService.getCurrentUser,
  
  // Auth state change subscription
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
  
  // Shop operations
  generateShopCode: shopService.generateShopCode,
  verifyShopCode: shopService.verifyShopCode,
};
