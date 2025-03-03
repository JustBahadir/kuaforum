
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

  // Admin kullanıcılarının her sayfaya erişimine izin verelim
  if (userRole === 'admin') {
    console.log("Admin user, no redirect needed");
    return false;
  }

  // Staff için sadece müşteri-spesifik sayfaları engelle
  if (userRole === 'staff' && 
      pathname.includes('/customer/') && 
      !pathname.includes('/customers')) {
    console.log("Staff trying to access customer page:", pathname);
    return true;
  } 
  
  // Müşteriler için personel sayfalarını engelle
  if (userRole === 'customer' && 
      (pathname.includes('/personnel') || 
       pathname.includes('/dashboard') ||
       pathname.includes('/shop-statistics') ||
       pathname.includes('/services') ||
       pathname.includes('/appointments') && !pathname.includes('/customer-dashboard'))) {
    console.log("Customer trying to access staff page:", pathname);
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
    if (currentPath.includes('personnel') || currentPath.includes('dashboard')) {
      return "/staff-login";
    } else if (currentPath.includes('customer')) {
      return "/login";
    }
    return "/";
  }
  
  // Admin için yönlendirme gerekmez
  if (userRole === 'admin') {
    // Eğer anasayfada ise ve giriş yapmışsa, dashboard'a yönlendir
    if (currentPath === "/") {
      return "/personnel";
    }
    return currentPath;
  }
  
  if (userRole === 'staff') {
    // Staff is trying to access customer pages
    if (currentPath.includes('/customer/') && !currentPath.includes('/customers')) {
      return "/personnel";
    }
    
    // If staff is at the root, redirect to personnel page
    if (currentPath === "/") {
      return "/personnel";
    }
    
    return currentPath;
  }
  
  if (userRole === 'customer') {
    // Customer is trying to access staff pages
    if (currentPath.includes('/personnel') || 
        currentPath.includes('/dashboard') ||
        currentPath.includes('/shop-statistics') ||
        currentPath.includes('/services') ||
        (currentPath.includes('/appointments') && !currentPath.includes('/customer-dashboard'))) {
      return "/customer-dashboard";
    }
    
    // If customer is at the root, redirect to customer dashboard
    if (currentPath === "/") {
      return "/customer-dashboard";
    }
    
    return currentPath;
  }
  
  return "/";
};
