
import { authenticationService } from './services/authenticationService';
import { shopService } from './services/shopService';

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
  
  // Shop operations
  generateShopCode: shopService.generateShopCode,
  verifyShopCode: shopService.verifyShopCode,
};
