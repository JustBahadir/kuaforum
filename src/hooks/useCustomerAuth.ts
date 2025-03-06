
import { useLocation } from "react-router-dom";
import { useAuthState } from "./auth/useAuthState";
import { useProfileManagement } from "./auth/useProfileManagement";
import { useSessionManagement } from "./auth/useSessionManagement";
import { useAuthCheck } from "./auth/useAuthCheck";

/**
 * Main authentication hook that composes specialized hooks
 */
export function useCustomerAuth() {
  const location = useLocation();
  
  // Initialize auth state
  const {
    userName,
    setUserName,
    userRole, 
    setUserRole,
    loading,
    setLoading,
    isAuthenticated,
    setIsAuthenticated,
    initialLoadDone,
    setInitialLoadDone,
    authCheckInProgress, 
    setAuthCheckInProgress,
    activeTab,
    resetAuthState
  } = useAuthState();
  
  // Initialize profile management
  const {
    dukkanId,
    dukkanAdi,
    refreshProfile,
    resetProfile
  } = useProfileManagement(userRole, isAuthenticated, setUserName);
  
  // Initialize session management
  const {
    handleLogout,
    resetSession
  } = useSessionManagement(resetAuthState, resetProfile, setInitialLoadDone);
  
  // Perform authentication check
  useAuthCheck(
    isAuthenticated,
    setIsAuthenticated,
    userRole,
    setUserRole,
    setLoading,
    initialLoadDone,
    setInitialLoadDone,
    authCheckInProgress,
    setAuthCheckInProgress,
    refreshProfile,
    location
  );
  
  return { 
    userName, 
    loading, 
    activeTab, 
    handleLogout,
    resetSession,
    refreshProfile, 
    userRole,
    isAuthenticated,
    dukkanId,
    dukkanAdi
  };
}
