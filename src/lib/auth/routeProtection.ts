
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
    pathname === "/appointments"
  ) {
    console.log("Genel erişimli sayfa, erişime izin verildi");
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
      pathname !== "/appointments"
    ) {
      console.log("Kimlik doğrulaması yapılmadı, şuradan yönlendiriliyor:", pathname);
      return true;
    }
    return false;
  }

  // Admin users have full access to admin pages
  if (userRole === 'admin') {
    // If admin is on the homepage, redirect to admin dashboard
    if (pathname === "/") {
      console.log("Admin ana sayfada, admin paneline yönlendiriliyor");
      return true;
    }
    
    // Admin trying to access customer pages
    if (pathname.includes('/customer-dashboard')) {
      console.log("Admin müşteri sayfasına erişmeye çalışıyor:", pathname);
      return true;
    }
    
    console.log("Admin kullanıcı, yönlendirme gerekmez");
    return false;
  }

  // Staff can't access customer-specific pages
  if (userRole === 'staff' && 
      pathname.includes('/customer-dashboard')) {
    console.log("Personel müşteri sayfasına erişmeye çalışıyor:", pathname);
    return true;
  } 
  
  // Staff on homepage should be redirected to their admin dashboard
  if (userRole === 'staff' && pathname === "/") {
    console.log("Personel ana sayfada, admin paneline yönlendiriliyor");
    return true;
  }
  
  // Staff attempting to access shop-home without authentication
  if (!isAuthenticated && 
      (pathname === "/shop-home" || 
       pathname === "/shop-settings" || 
       pathname === "/personnel")) {
    console.log("Kimlik doğrulaması yapılmamış kullanıcı personel sayfasına erişmeye çalışıyor:", pathname);
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
       pathname.includes('/admin/appointments') ||
       pathname === "/personnel")) { 
    console.log("Müşteri personel sayfasına erişmeye çalışıyor:", pathname);
    return true;
  }

  // Customer on homepage stays on homepage - no redirect needed
  if (userRole === 'customer' && pathname === "/") {
    console.log("Müşteri ana sayfada, yönlendirme gerekmez");
    return false;
  }

  console.log("Yönlendirme gerekmez:", pathname, "Rol:", userRole);
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
    if (currentPath.includes('admin') || currentPath === "/admin/dashboard") {
      return "/admin";
    } else if (currentPath.includes('customer-dashboard')) {
      return "/login";
    } else if (currentPath === "/personnel" || 
              currentPath === "/shop-home" || 
              currentPath === "/shop-settings" ||
              currentPath === "/shop-statistics") {
      return "/admin";
    }
    return "/login"; // Default to login page for unauthenticated users
  }
  
  // Admin redirect to admin dashboard from homepage
  if (userRole === 'admin' && currentPath === "/") {
    return "/admin/dashboard";
  }
  
  // Staff redirect to admin dashboard from homepage or trying to access /personnel directly
  if (userRole === 'staff') {
    if (currentPath === "/" || currentPath === "/personnel") {
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
        currentPath.includes('/admin/appointments') ||
        currentPath === "/personnel") {
      return "/customer-dashboard";
    }
    
    // Customer on homepage should go to customer dashboard
    if (currentPath === "/") {
      return "/customer-dashboard";
    }
  }
  
  return currentPath;
};
