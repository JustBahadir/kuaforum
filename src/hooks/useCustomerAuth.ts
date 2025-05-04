
// Temporary disabled hook to fix build errors
export const useCustomerAuth = () => {
  return {
    isAuthenticated: false,
    userRole: null,
    loading: false,
    user: null,
    profileData: null
  };
};
