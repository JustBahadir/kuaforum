
import { getProfile, getUserRole } from './profileServices/fetchProfile';
import { updateProfile, createOrUpdateProfile } from './profileServices/updateProfile';

// Function to clean IBAN before sending to the server
const cleanIBANForStorage = (iban?: string) => {
  if (!iban) return undefined;
  return iban.replace(/\s/g, '').replace(/[^A-Z0-9]/g, '');
};

// Function to validate IBAN format
const validateIBAN = (iban: string) => {
  // Basic validation: starts with TR and has more characters
  if (!iban.startsWith('TR') && iban.length < 5) {
    return 'TR'; // Ensure it at least starts with TR
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
  }
};
