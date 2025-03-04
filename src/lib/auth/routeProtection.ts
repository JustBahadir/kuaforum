
/**
 * Determine if the current route should redirect
 */
export const shouldRedirect = (
  isAuthenticated: boolean,
  userRole: string | null,
  pathname: string
): boolean => {
  // Public pages that anyone can access
  if (
    pathname === "/" || 
    pathname === "/login" || 
    pathname === "/staff-login"
  ) {
    console.log("Public page access allowed");
    return false;
  }

  // Not authenticated
  if (!isAuthenticated) {
    // Only allow access to public routes when not authenticated
    if (
      pathname !== "/" && 
      pathname !== "/login" && 
      pathname !== "/staff-login"
    ) {
      console.log("Not authenticated, redirecting from:", pathname);
      return true;
    }
    return false;
  }

  // Admin users have full access
  if (userRole === 'admin') {
    // If admin is on the homepage, redirect to personnel page
    if (pathname === "/") {
      console.log("Admin on homepage, redirecting to personnel page");
      return true;
    }
    console.log("Admin user, no redirect needed");
    return false;
  }

  // Staff can't access customer-specific pages
  if (userRole === 'staff' && 
      pathname.includes('/customer-dashboard')) {
    console.log("Staff trying to access customer page:", pathname);
    return true;
  } 
  
  // Staff on homepage should be redirected to their staff pages
  if (userRole === 'staff' && pathname === "/") {
    console.log("Staff on homepage, redirecting to personnel page");
    return true;
  }
  
  // Customers can't access staff pages
  if (userRole === 'customer' && 
      (pathname.includes('/personnel') || 
       pathname.includes('/shop-settings') ||
       pathname.includes('/shop-statistics') ||
       pathname.includes('/services') ||
       pathname.includes('/appointments') && !pathname.includes('/customer-dashboard') ||
       pathname.includes('/staff-profile'))) {
    console.log("Customer trying to access staff page:", pathname);
    return true;
  }

  // Customer on homepage should be redirected to customer dashboard
  if (userRole === 'customer' && pathname === "/") {
    console.log("Customer on homepage, redirecting to customer dashboard");
    return true;
  }

  console.log("No redirect needed for:", pathname, "Role:", userRole);
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
    // If not authenticated and trying to access a secured route, redirect to login
    if (currentPath.includes('personnel') || 
        currentPath.includes('staff') || 
        currentPath.includes('shop-')) {
      return "/staff-login";
    } else if (currentPath.includes('customer')) {
      return "/login";
    }
    return "/";
  }
  
  // Admin redirect to personnel page from homepage
  if (userRole === 'admin' && currentPath === "/") {
    return "/personnel";
  }
  
  // Staff redirect to personnel page from homepage
  if (userRole === 'staff') {
    if (currentPath === "/") {
      return "/personnel";
    }
    
    // Staff trying to access customer-specific pages
    if (currentPath.includes('/customer-dashboard')) {
      return "/personnel";
    }
  }
  
  if (userRole === 'customer') {
    // Customer trying to access staff pages
    if (currentPath.includes('/personnel') || 
        currentPath.includes('/shop-settings') ||
        currentPath.includes('/shop-statistics') ||
        currentPath.includes('/services') ||
        (currentPath.includes('/appointments') && !currentPath.includes('/customer-dashboard')) ||
        currentPath.includes('/staff-profile')) {
      return "/customer-dashboard";
    }
    
    // Customer at homepage
    if (currentPath === "/") {
      return "/customer-dashboard";
    }
  }
  
  return currentPath;
};
