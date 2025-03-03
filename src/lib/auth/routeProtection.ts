
/**
 * Determine if the current route should redirect
 */
export const shouldRedirect = (
  isAuthenticated: boolean,
  userRole: string | null,
  pathname: string
): boolean => {
  // Ana sayfaya ve login sayfalarına her zaman erişime izin ver
  if (
    pathname === "/" || 
    pathname === "/login" || 
    pathname === "/staff-login"
  ) {
    return false;
  }

  // Not authenticated
  if (!isAuthenticated) {
    // Only allow access to public routes when not authenticated
    if (
      pathname !== "/" && 
      pathname !== "/login" && 
      pathname !== "/staff-login" &&
      !pathname.startsWith("/customer-dashboard")
    ) {
      return true;
    }
    return false;
  }

  // Check user role for redirects
  if ((userRole === 'staff' || userRole === 'admin') && 
      pathname.includes('/customer')) {
    return true;
  } 
  
  if (userRole === 'customer' && 
      (pathname.includes('/personnel') || 
       pathname.includes('/dashboard'))) {
    return true;
  }

  return false;
};

/**
 * Get the appropriate redirect path based on user role
 */
export const getRedirectPath = (
  isAuthenticated: boolean,
  userRole: string | null,
  currentPath: string
): string => {
  if (!isAuthenticated) {
    return "/staff-login";
  }
  
  if ((userRole === 'staff' || userRole === 'admin') && 
      currentPath.includes('/customer')) {
    return "/personnel";
  }
  
  if (userRole === 'customer' && 
      (currentPath.includes('/personnel') || 
       currentPath.includes('/dashboard'))) {
    return "/customer-dashboard";
  }
  
  return "/";
};
