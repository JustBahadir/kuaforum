
import React, { useEffect, useState, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "./authService";
import { profileService } from "./profileService";
import { shouldRedirect, getRedirectPath } from "./routeProtection";

// Context for route protection
const RouteProtectionContext = createContext({
  isAuthenticated: false,
  userRole: null as string | null,
  loading: true,
});

// Hook to use route protection context
export const useRouteProtection = () => useContext(RouteProtectionContext);

// Route protection provider component
export function RouteProtectionProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const user = await authService.getCurrentUser();
        
        if (user) {
          setIsAuthenticated(true);
          const role = await profileService.getUserRole();
          setUserRole(role);
          
          if (shouldRedirect(true, role, location.pathname)) {
            const redirectPath = getRedirectPath(true, role, location.pathname);
            navigate(redirectPath);
          }
        } else {
          setIsAuthenticated(false);
          
          if (shouldRedirect(false, null, location.pathname)) {
            const redirectPath = getRedirectPath(false, null, location.pathname);
            navigate(redirectPath);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Set up auth state change listener
    const { data } = authService.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        const role = await profileService.getUserRole();
        setUserRole(role);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole(null);
        
        if (location.pathname !== '/') {
          navigate('/');
        }
      }
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);
  
  return (
    <RouteProtectionContext.Provider value={{ isAuthenticated, userRole, loading }}>
      {children}
    </RouteProtectionContext.Provider>
  );
}
