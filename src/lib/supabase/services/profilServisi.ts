
import { getProfile, getUserRole } from './profileServices/fetchProfile';
import { updateProfile, createOrUpdateProfile } from './profileServices/updateProfile';

// Function to clean IBAN before sending to the server
const cleanIBANForStorage = (iban?: string) => {
  if (!iban) return undefined;
  // Remove all spaces and non-alphanumeric characters except for TR prefix
  return iban.replace(/\s/g, '').replace(/[^A-Z0-9]/g, '');
};

// Function to format IBAN with TR prefix and proper spacing
const formatIBAN = (iban: string) => {
  // Clean the IBAN first
  let cleaned = iban.replace(/[^A-Z0-9]/g, '');
  
  // Ensure it starts with TR
  if (!cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.substring(0, cleaned.startsWith('T') ? 25 : cleaned.startsWith('R') ? 25 : 24);
  } else {
    cleaned = cleaned.substring(0, 26); // Limit to 26 characters (TR + 24 digits)
  }
  
  // Format with spaces every 4 characters
  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }
  
  return formatted;
};

// Function to validate IBAN format
const validateIBAN = (iban: string) => {
  // Basic validation: ensure it has TR prefix
  if (!iban.startsWith('TR')) {
    return 'TR' + iban.replace(/[^0-9]/g, '');
  }
  return iban;
};

// Export the profile service interface with IBAN formatting
export const profilServisi = {
  getir: getProfile,
  guncelle: (data: any) => {
    // Validate and clean IBAN if present
    if (data.iban) {
      data.iban = validateIBAN(cleanIBANForStorage(data.iban));
    }
    return updateProfile(data);
  },
  getUserRole,
  createOrUpdateProfile: (userId: string, data: any) => {
    // Validate and clean IBAN if present
    if (data.iban) {
      data.iban = validateIBAN(cleanIBANForStorage(data.iban));
    }
    return createOrUpdateProfile(userId, data);
  },
  formatIBAN // Export the IBAN formatter for use in other components
};
