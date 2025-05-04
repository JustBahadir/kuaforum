
// Temporary disabled hook to fix build errors
export const useProfileManagement = () => {
  return {
    user: null,
    profileData: null,
    businessData: null,
    loading: false,
    error: null,
    updateProfile: async () => {},
    updateAvatar: async () => {},
    uploadAvatar: async () => {}
  };
};
