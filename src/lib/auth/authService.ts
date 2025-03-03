
import { userService } from './services/userService';
import { authenticationService } from './services/authenticationService';
import { shopService } from './services/shopService';

/**
 * Service to handle authentication-related operations
 */
export const authService = {
  // User operations
  getCurrentUser: userService.getCurrentUser,
  findUserByEmail: userService.findUserByEmail,
  deleteUserByEmail: userService.deleteUserByEmail,
  onAuthStateChange: userService.onAuthStateChange,
  
  // Authentication operations
  signOut: authenticationService.signOut,
  
  // Shop operations
  generateShopCode: shopService.generateShopCode,
  verifyShopCode: shopService.verifyShopCode,
};
