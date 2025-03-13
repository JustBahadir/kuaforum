
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Public pages that don't require authentication
  const publicPages = ["/", "/login", "/admin", "/staff-login"];

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
          if (isMounted) navigate('/login');
          return;
        }
        
        const userRole = data.session.user.user_metadata?.role;
        
        // Check admin/staff routes access
        if (location.pathname.startsWith('/shop-') || 
            location.pathname === '/shop-home' || 
            location.pathname.startsWith('/admin') ||
            location.pathname === '/admin/operations') {
          if (userRole !== 'admin' && userRole !== 'staff') {
            if (isMounted) navigate('/staff-login');
            return;
          }
        }
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
      } finally {
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
