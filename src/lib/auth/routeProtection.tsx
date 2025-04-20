import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface RouteProtectionProps {
  children: ReactNode;
}

/**
 * RouteProtection component to handle authentication redirection
 */
export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { isAuthenticated, userRole, loading } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (shouldRedirect(isAuthenticated, userRole, location.pathname)) {
        const redirectPath = getRedirectPath(isAuthenticated, userRole, location.pathname);
        console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, loading]);

  // If loading, show a loading indicator or nothing
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};

export const shouldRedirect = (
  isAuthenticated: boolean,
  userRole: string | null,
  pathname: string
): boolean => {
  const publicPaths = ["/", "/login", "/admin", "/staff-login", "/services", "/appointments"];

  // Public pages access
  if (publicPaths.includes(pathname)) return false;

  // Not authenticated
  if (!isAuthenticated) {
    // If trying to access protected pages
    if (!publicPaths.includes(pathname)) return true;
    return false;
  }

  if (userRole === "admin") {
    if (pathname.includes("/customer-dashboard")) return true;
    if (pathname === "/") return false;

    if (["/login", "/admin", "/staff-login"].includes(pathname)) return true;
    return false;
  }

  if (userRole === "staff") {
    // Staff can access staff pages
    if (pathname.includes("/customer-dashboard")) return true;
    if (pathname === "/") return false;

    if (["/login", "/admin", "/staff-login"].includes(pathname)) return true;
    return false;
  }

  // Customers can't access staff/admin pages
  if (userRole === "customer") {
    if (
      ["/admin", "/shop-home", "/shop-settings", "/shop-statistics", "/admin/services", "/operations-history", "/admin/appointments", "/personnel"].some(p =>
        pathname.startsWith(p)
      )
    ) {
      return true;
    }
    if (["/admin", "/login", "/staff-login"].includes(pathname)) return true;
    if (pathname === "/") return false;
  }

  return false;
};

export const getRedirectPath = (
  isAuthenticated: boolean,
  userRole: string | null,
  currentPath: string
): string => {
  if (!isAuthenticated) {
    return "/login";
  }

  if (userRole === "admin") {
    if (currentPath === "/login" || currentPath === "/admin" || currentPath === "/staff-login") {
      return "/shop-home";
    }
    if (currentPath.includes("/customer-dashboard")) {
      return "/shop-home";
    }
  }

  if (userRole === "staff") {
    if (currentPath === "/login" || currentPath === "/admin" || currentPath === "/staff-login") {
      return "/shop-home";
    }
    if (currentPath.includes("/customer-dashboard")) {
      return "/shop-home";
    }
  }

  if (userRole === "customer") {
    if (
      ["/admin", "/shop-home", "/shop-settings", "/shop-statistics", "/admin/services", "/operations-history", "/admin/appointments", "/personnel"].some(p =>
        currentPath.startsWith(p)
      )
    ) {
      return "/customer-dashboard";
    }
    if (currentPath === "/admin" || currentPath === "/login" || currentPath === "/staff-login") {
      return "/customer-dashboard";
    }
  }

  return currentPath;
};
