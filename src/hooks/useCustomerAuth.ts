
// Geçici devre dışı bırakılmış hook - build hatalarını önlemek için
export const useCustomerAuth = () => {
  return {
    isAuthenticated: false,
    userName: "",
    userRole: null,
    loading: false,
    user: null,
    profileData: null,
    handleLogout: () => Promise.resolve()
  };
};
