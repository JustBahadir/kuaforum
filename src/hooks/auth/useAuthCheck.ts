
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { shouldRedirect, getRedirectPath } from "@/lib/auth/routeProtection";

/**
 * Hook for performing the initial authentication check
 */
export function useAuthCheck(
  isAuthenticated: boolean,
  setIsAuthenticated: (value: boolean) => void,
  userRole: string | null,
  setUserRole: (role: string | null) => void,
  setLoading: (loading: boolean) => void,
  initialLoadDone: boolean,
  setInitialLoadDone: (done: boolean) => void,
  authCheckInProgress: boolean,
  setAuthCheckInProgress: (inProgress: boolean) => void,
  refreshProfile: () => Promise<void>,
  location: {pathname: string}
) {
  const navigate = useNavigate();

  // Perform initial auth check
  useEffect(() => {
    // Eğer auth check zaten devam ediyorsa, çift kontrolü önle
    if (authCheckInProgress) return;
    
    async function checkAuthStatus() {
      if (initialLoadDone) return; // Bir kez çalıştır, sonra çık
      
      try {
        setLoading(true);
        setAuthCheckInProgress(true);
        
        const user = await authService.getCurrentUser();
        console.log("Current user check result:", user ? "User found" : "No user");
        
        if (!user) {
          setIsAuthenticated(false);
          setUserRole(null);
          
          // Ana sayfada veya login sayfalarında ise yönlendirme yapma
          if (location.pathname === "/" || 
              location.pathname === "/login" || 
              location.pathname === "/admin") {
            console.log("On public page, not redirecting");
          } else {
            console.log("Not authenticated, redirecting to home");
            navigate("/");
          }
        } else {
          setIsAuthenticated(true);
          
          // Get role from user metadata for more reliable role checking
          const role = user.user_metadata?.role || await profileService.getUserRole();
          setUserRole(role);
          console.log("User role determined:", role);
          
          // Bu kontrolü bir kez yapıyoruz, ama sonsuz döngü oluşmayacak şekilde
          if (shouldRedirect(true, role, location.pathname)) {
            const redirectPath = getRedirectPath(true, role, location.pathname);
            console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
            navigate(redirectPath);
          } else {
            console.log("No redirection needed");
          }
          
          await refreshProfile();
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setIsAuthenticated(false);
      } finally {
        setInitialLoadDone(true);
        setAuthCheckInProgress(false);
        setLoading(false);
      }
    }
    
    checkAuthStatus();
  }, [navigate, location.pathname, initialLoadDone, authCheckInProgress]);
}
