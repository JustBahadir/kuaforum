import { getProfile, getUserRole } from './profileServices/fetchProfile';
import { updateProfile, createOrUpdateProfile } from './profileServices/updateProfile';

// Function to clean IBAN before sending to the server
const cleanIBANForStorage = (iban?: string) => {
  if (!iban) return undefined;
  
  // Remove all spaces and non-digit characters, but keep TR
  let cleaned = iban.replace(/\s/g, '');
  
  // Ensure it starts with TR and contains only digits after that
  if (!cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.replace(/\D/g, '');
  } else {
    cleaned = 'TR' + cleaned.substring(2).replace(/\D/g, '');
  }
  
  // Limit to TR + 24 digits maximum (26 chars total)
  return cleaned.substring(0, 26);
};

// Function to format IBAN with TR prefix and proper spacing
const formatIBAN = (iban: string) => {
  if (!iban) return '';
  
  // Clean the IBAN first
  let cleaned = iban.replace(/\s/g, '');
  
  // Ensure it starts with TR
  if (!cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.replace(/\D/g, '');
  } else {
    cleaned = 'TR' + cleaned.substring(2).replace(/\D/g, '');
  }
  
  // Limit to 26 characters (TR + 24 digits)
  cleaned = cleaned.substring(0, 26);
  
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
  if (!iban) return '';
  
  // Ensure it has TR prefix and only contains digits after that
  if (!iban.startsWith('TR')) {
    return 'TR' + iban.replace(/\D/g, '');
  }
  
  // Make sure there are only digits after TR
  return 'TR' + iban.substring(2).replace(/\D/g, '');
};

// Export the profile service interface with IBAN formatting
export const profilServisi = {
  getir: getProfile,
  guncelle: (data: any) => {
    // Validate and clean IBAN if present
    if (data.iban) {
      data.iban = validateIBAN(cleanIBANForStorage(data.iban) || '');
    }
    return updateProfile(data);
  },
  getUserRole,
  createOrUpdateProfile: (userId: string, data: any) => {
    // Validate and clean IBAN if present
    if (data.iban) {
      data.iban = validateIBAN(cleanIBANForStorage(data.iban) || '');
    }
    return createOrUpdateProfile(userId, data);
  },
  formatIBAN, // Export the IBAN formatter for use in other components
  validateIBAN, // Export the IBAN validator
  cleanIBANForStorage // Export the IBAN cleaner
};
