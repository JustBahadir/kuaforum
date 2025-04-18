
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Public pages that don't require authentication
  const publicPages = ["/", "/login", "/register", "/staff-login", "/auth/callback"];

  useEffect(() => {
    let isMounted = true;
    let timeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        // If it's a public page, no need for session check
        const isPublicPage = publicPages.some(page => 
          location.pathname === page || location.pathname.startsWith(`${page}/`)
        );
        
        if (isPublicPage) {
          if (isMounted) setChecking(false);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          throw error;
        }
        
        if (!data.session) {
          if (isMounted) {
            console.log("No session, redirecting to login");
            toast.error("Lütfen önce giriş yapın");
            navigate('/staff-login');
          }
          return;
        }
        
        // Special case for profile completion
        if (location.pathname === '/register-profile') {
          if (isMounted) setChecking(false);
          return;
        }
        
        // Get user role from the edge function to avoid RLS issues
        const { data: roleData, error: roleError } = await supabase.functions.invoke('get_current_user_role');
        
        if (roleError) {
          console.error("Error getting user role:", roleError);
          // Fallback to metadata role
          const userRole = data.session.user.user_metadata?.role;
          handleRoleBasedRouting(userRole, location.pathname, navigate, isMounted);
        } else {
          // Use role from edge function
          const userRole = roleData?.role;
          handleRoleBasedRouting(userRole, location.pathname, navigate, isMounted);
        }
        
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
        if (isMounted) {
          setChecking(false);
          toast.error("Oturum kontrolü sırasında bir hata oluştu");
        }
      }
    };
    
    checkSession();
    
    // Set a maximum timeout to avoid infinite loading
    timeout = setTimeout(() => {
      if (isMounted) setChecking(false);
    }, 3000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [location.pathname, navigate]);

  if (checking && !publicPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg">Yükleniyor...</p>
        <p className="text-sm text-gray-500 mt-2">Oturum kontrolü yapılıyor</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Helper function to handle role-based routing
function handleRoleBasedRouting(
  userRole: string | undefined | null,
  pathname: string,
  navigate: (path: string) => void,
  isMounted: boolean
) {
  console.log("Current user role:", userRole, "at pathname:", pathname);
  
  // Handle staff routes
  if (userRole === 'staff') {
    // Staff can only access staff-profile page
    if (
      pathname !== '/staff-profile' && 
      !pathname.startsWith('/staff-profile/')
    ) {
      if (isMounted) {
        console.log("Staff user redirected to staff profile page");
        navigate('/staff-profile');
      }
      return;
    }
  }
  
  // Handle business_owner routes
  if (userRole === 'business_owner') {
    // Business owner can only access shop-home and related routes
    if (
      pathname !== '/register-profile' &&
      pathname !== '/shop-home' && 
      !pathname.startsWith('/shop-') && 
      !pathname.startsWith('/personnel') && 
      !pathname.startsWith('/operations-history') && 
      !pathname.startsWith('/customers')
    ) {
      if (isMounted) {
        console.log("Business owner redirected to shop home page");
        navigate('/shop-home');
      }
      return;
    }
  }
  
  // Handle admin routes
  if (userRole === 'admin') {
    // Admin can access all routes
    return;
  }
  
  // Handle customer routes
  if (userRole === 'customer') {
    // Restrict access to staff, business and admin routes
    if (
      pathname.startsWith('/shop-') || 
      pathname === '/staff-profile' || 
      pathname.startsWith('/admin')
    ) {
      if (isMounted) {
        console.log("Customer restricted from admin area");
        toast.error("Bu sayfaya erişim yetkiniz yok");
        navigate('/customer-dashboard');
      }
    }
  }
  
  // Check for incomplete profile
  if (!userRole && pathname !== '/register-profile') {
    if (isMounted) {
      console.log("User role not found, redirecting to profile completion");
      toast.info("Lütfen önce profilinizi tamamlayın");
      navigate('/register-profile');
    }
    return;
  }
}
