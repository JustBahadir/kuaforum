
// Temporary disabled hook to fix build errors
export const useProfileManagement = () => {
  return {
    user: null,
    profile: null,
    business: null,
    isLoading: false,
    error: null,
    updateProfile: async () => {},
    updateAvatar: async () => {},
    uploadAvatar: async () => {}
  };
};
