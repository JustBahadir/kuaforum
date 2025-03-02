
import { getProfile, getUserRole } from './profileServices/fetchProfile';
import { updateProfile, createOrUpdateProfile } from './profileServices/updateProfile';

// Export the profile service interface
export const profilServisi = {
  getir: getProfile,
  guncelle: updateProfile,
  getUserRole,
  createOrUpdateProfile
};
