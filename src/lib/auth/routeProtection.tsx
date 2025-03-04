
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

// Define routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/admin",
  "/admin/register"
];

// Define route access based on user roles
const roleBasedRoutes = {
  customer: [
    "/account",
    "/profile",
    "/services"
  ],
  staff: [
    "/admin/dashboard",
    "/admin/shop",
    "/admin/services",
    "/admin/personnel",
    "/admin/appointments",
    "/admin/customers",
    "/admin/profile",
    "/admin/statistics",
    "/admin/settings",
    "/admin/operations"
  ],
  admin: [
    "/admin/dashboard",
    "/admin/shop",
    "/admin/create-shop",
    "/admin/services",
    "/admin/personnel",
    "/admin/appointments",
    "/admin/customers",
    "/admin/profile",
    "/admin/statistics",
    "/admin/settings",
    "/admin/shop-settings",
    "/admin/operations-history",
    "/admin/operations"
  ]
};

// Check if the user should be redirected based on auth state and current path
export function shouldRedirect(
  isAuthenticated: boolean,
  userRole: string | null,
  currentPath: string
): boolean {
  // If not authenticated and on a private route, redirect to login
  if (!isAuthenticated && !publicRoutes.includes(currentPath)) {
    return true;
  }

  // If authenticated but on a route not for their role
  if (isAuthenticated && userRole && !publicRoutes.includes(currentPath)) {
    const allowedRoutes = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes] || [];
    
    // Check if current path starts with any of the allowed routes
    const hasAccess = allowedRoutes.some(route => 
      currentPath === route || currentPath.startsWith(`${route}/`)
    );
    
    return !hasAccess;
  }

  return false;
}

// Get the appropriate redirect path based on auth state and user role
export function getRedirectPath(
  isAuthenticated: boolean,
  userRole: string | null,
  currentPath: string
): string {
  // If not authenticated, redirect to login or appropriate login page
  if (!isAuthenticated) {
    if (currentPath.includes('/admin')) {
      return "/admin";
    }
    return "/login";
  }

  // If authenticated but wrong role, redirect to appropriate dashboard
  if (userRole === 'customer') {
    return "/account";
  } else if (userRole === 'staff' || userRole === 'admin') {
    return "/admin/shop";
  }

  // Default fallback
  return "/";
}

// Create context for route protection
type RouteProtectionContextType = {
  isLoading: boolean;
};

const RouteProtectionContext = createContext<RouteProtectionContextType>({
  isLoading: true
});

export const useRouteProtection = () => useContext(RouteProtectionContext);

// Route protection provider component
interface RouteProtectionProviderProps {
  children: ReactNode;
}

function RouteProtectionProvider({ children }: RouteProtectionProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated, check if trying to access private route
          if (!publicRoutes.includes(location.pathname)) {
            console.log("Not authenticated, redirecting to login");
            navigate(location.pathname.includes('/admin') ? "/admin" : "/login");
          }
        } else {
          // Authenticated, check role-based access
          const userRole = await profilServisi.getUserRole();
          
          if (shouldRedirect(true, userRole, location.pathname)) {
            const redirectPath = getRedirectPath(true, userRole, location.pathname);
            console.log(`Role-based redirect from ${location.pathname} to ${redirectPath}`);
            navigate(redirectPath);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  return (
    <RouteProtectionContext.Provider value={{ isLoading }}>
      {children}
    </RouteProtectionContext.Provider>
  );
}

export default RouteProtectionProvider;
