
import { getProfile, getUserRole } from './profileServices/fetchProfile';
import { updateProfile, createOrUpdateProfile } from './profileServices/updateProfile';

// Function to clean IBAN before sending to the server
const cleanIBANForStorage = (iban?: string) => {
  if (!iban) return undefined;
  return iban.replace(/\s/g, '');
};

// Export the profile service interface with IBAN formatting
export const profilServisi = {
  getir: getProfile,
  guncelle: (data: any) => {
    // Clean IBAN if present
    if (data.iban) {
      data.iban = cleanIBANForStorage(data.iban);
    }
    return updateProfile(data);
  },
  getUserRole,
  createOrUpdateProfile: (userId: string, data: any) => {
    // Clean IBAN if present
    if (data.iban) {
      data.iban = cleanIBANForStorage(data.iban);
    }
    return createOrUpdateProfile(userId, data);
  }
};
