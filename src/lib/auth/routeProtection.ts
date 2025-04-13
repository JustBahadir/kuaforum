
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
    pathname === "/staff-login" ||
    pathname === "/auth" ||
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
      pathname !== "/staff-login" &&
      pathname !== "/auth" &&
      pathname !== "/services" &&
      pathname !== "/appointments"
    ) {
      console.log("Kimlik doğrulaması yapılmadı, şuradan yönlendiriliyor:", pathname);
      return true;
    }
    return false;
  }

  // Admin users should not access customer routes
  if (userRole === 'admin') {
    if (pathname.includes('/customer-dashboard')) {
      console.log("Admin müşteri sayfasına erişmeye çalışıyor, yönlendiriliyor");
      return true;
    }
    
    // Admin on public pages should be redirected to admin dashboard
    if (pathname === "/" || pathname === "/login" || pathname === "/admin" || pathname === "/staff-login" || pathname === "/auth") {
      console.log("Admin giriş sayfasında, yönetim paneline yönlendiriliyor");
      return true;
    }
    
    return false;
  }

  // Staff should not access customer routes
  if (userRole === 'staff') {
    if (pathname.includes('/customer-dashboard')) {
      console.log("Personel müşteri sayfasına erişmeye çalışıyor, yönlendiriliyor");
      return true;
    }
    
    // Staff on public pages should be redirected to staff dashboard
    if (pathname === "/" || pathname === "/login" || pathname === "/admin" || pathname === "/staff-login" || pathname === "/auth") {
      console.log("Personel giriş sayfasında, yönetim paneline yönlendiriliyor");
      return true;
    }
    
    return false;
  }
  
  // Customers should not access staff/admin pages
  if (userRole === 'customer') { 
    if (pathname.includes('/admin') || 
       pathname.includes('/shop-home') || 
       pathname.includes('/shop-settings') ||
       pathname.includes('/shop-statistics') ||
       pathname === "/personnel") { 
      console.log("Müşteri personel sayfasına erişmeye çalışıyor, yönlendiriliyor");
      return true;
    }

    // Customer on public pages should be redirected to customer dashboard
    if (pathname === "/" || pathname === "/login" || pathname === "/admin" || pathname === "/staff-login" || pathname === "/auth") {
      console.log("Müşteri giriş sayfasında, müşteri paneline yönlendiriliyor");
      return true;
    }
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
    // If not authenticated and trying to access a secured route
    if (currentPath.includes('admin') || currentPath.includes('shop-')) {
      return "/staff-login";
    } else if (currentPath.includes('customer-dashboard')) {
      return "/auth";
    }
    return "/auth"; // Default to auth page for unauthenticated users
  }
  
  // Admin redirect based on path
  if (userRole === 'admin') {
    if (currentPath === "/" || 
        currentPath === "/login" || 
        currentPath === "/staff-login" ||
        currentPath === "/auth" || 
        currentPath === "/admin") {
      return "/shop-home";
    }
    
    // Admin trying to access customer-specific pages
    if (currentPath.includes('/customer-dashboard')) {
      return "/shop-home";
    }
  }
  
  // Staff redirect based on path
  if (userRole === 'staff') {
    if (currentPath === "/" || 
        currentPath === "/login" || 
        currentPath === "/staff-login" ||
        currentPath === "/auth" || 
        currentPath === "/admin") {
      return "/shop-home";
    }
    
    // Staff trying to access customer-specific pages
    if (currentPath.includes('/customer-dashboard')) {
      return "/shop-home";
    }
  }
  
  if (userRole === 'customer') {
    // Customer trying to access staff/admin pages
    if (currentPath.includes('/admin') || 
        currentPath.includes('/shop-home') ||
        currentPath.includes('/shop-settings') ||
        currentPath.includes('/shop-statistics') ||
        currentPath === "/personnel") {
      return "/customer-dashboard";
    }
    
    // Customer on login pages should go to customer dashboard
    if (currentPath === "/" || 
        currentPath === "/login" || 
        currentPath === "/staff-login" ||
        currentPath === "/auth" || 
        currentPath === "/admin") {
      return "/customer-dashboard";
    }
  }
  
  return currentPath;
};
