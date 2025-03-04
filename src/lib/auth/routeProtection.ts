
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
    pathname === "/admin" ||
    pathname === "/services" ||
    pathname === "/appointments"  // Adding appointments to public routes
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
      pathname !== "/admin" &&
      pathname !== "/services" &&
      pathname !== "/appointments"  // Adding appointments to allowed routes
    ) {
      console.log("Not authenticated, redirecting from:", pathname);
      return true;
    }
    return false;
  }

  // Admin users have full access
  if (userRole === 'admin') {
    // If admin is on the homepage, redirect to admin dashboard
    if (pathname === "/") {
      console.log("Admin on homepage, redirecting to admin dashboard");
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
  
  // Staff on homepage should be redirected to their admin dashboard
  if (userRole === 'staff' && pathname === "/") {
    console.log("Staff on homepage, redirecting to admin dashboard");
    return true;
  }
  
  // Customers can't access staff pages
  if (userRole === 'customer' && 
      (pathname.includes('/admin') || 
       pathname.includes('/shop-home') || 
       pathname.includes('/shop-settings') ||
       pathname.includes('/shop-statistics') ||
       pathname.includes('/admin/services') ||
       pathname.includes('/operations-history') ||
       pathname.includes('/admin/appointments'))) {
    console.log("Customer trying to access staff page:", pathname);
    return true;
  }

  // Customer on homepage stays on homepage - no redirect needed
  if (userRole === 'customer' && pathname === "/") {
    console.log("Customer on homepage, no redirect needed");
    return false;
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
    if (currentPath.includes('admin')) {
      return "/admin";
    } else if (currentPath.includes('customer-dashboard')) {
      return "/login";
    }
    return "/";
  }
  
  // Admin redirect to admin dashboard from homepage
  if (userRole === 'admin' && currentPath === "/") {
    return "/admin/dashboard";
  }
  
  // Staff redirect to admin dashboard from homepage
  if (userRole === 'staff') {
    if (currentPath === "/") {
      return "/admin/dashboard";
    }
    
    // Staff trying to access customer-specific pages
    if (currentPath.includes('/customer-dashboard')) {
      return "/admin/dashboard";
    }
  }
  
  if (userRole === 'customer') {
    // Customer trying to access staff pages
    if (currentPath.includes('/admin') || 
        currentPath.includes('/shop-home') ||
        currentPath.includes('/shop-settings') ||
        currentPath.includes('/shop-statistics') ||
        currentPath.includes('/admin/services') ||
        currentPath.includes('/operations-history') ||
        (currentPath.includes('/admin/appointments'))) {
      return "/customer-dashboard";
    }
  }
  
  return currentPath;
};
