
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

  // Define public routes that don't require authentication
  const publicPages = ["/", "/login", "/staff-login", "/auth"];

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
        
        if (error || !data.session) {
          if (isMounted) {
            console.log("No session, redirecting to login");
            navigate('/auth');
          }
          return;
        }
        
        const userRole = data.session.user.user_metadata?.role;
        console.log("RouteProtection - Current user role:", userRole, "at pathname:", location.pathname);
        
        // Check admin/staff routes access
        if (location.pathname.startsWith('/shop-') || 
            location.pathname === '/shop-home' || 
            location.pathname.startsWith('/admin')) {
          if (userRole !== 'admin' && userRole !== 'staff') {
            if (isMounted) {
              console.log("User is not staff/admin, redirecting to staff-login");
              toast.error("Bu sayfaya erişim yetkiniz yok. Lütfen personel hesabı ile giriş yapın.");
              navigate('/staff-login');
            }
            return;
          }
        }
        
        // Check customer routes access
        if (location.pathname.includes('/customer-dashboard')) {
          if (userRole !== 'customer') {
            if (isMounted) {
              console.log("User is not customer, redirecting to appropriate dashboard");
              if (userRole === 'admin' || userRole === 'staff') {
                navigate('/shop-home');
              } else {
                navigate('/login');
              }
            }
            return;
          }
        }
        
        // Handle post-login direct to dashboard based on role
        if (location.pathname === '/') {
          if (userRole === 'admin' || userRole === 'staff') {
            if (isMounted) {
              console.log("Admin/staff at homepage, redirecting to shop-home");
              navigate('/shop-home');
            }
            return;
          } else if (userRole === 'customer') {
            if (isMounted) {
              console.log("Customer at homepage, redirecting to customer-dashboard");
              navigate('/customer-dashboard');
            }
            return;
          }
        }
        
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
        if (isMounted) setChecking(false);
      }
    };
    
    checkSession();
    
    // Set a maximum timeout to avoid infinite loading
    timeout = setTimeout(() => {
      if (isMounted) setChecking(false);
    }, 1500);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [location.pathname, navigate]);

  if (checking && !publicPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
