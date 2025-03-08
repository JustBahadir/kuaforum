
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { isAuthenticated, userRole, loading } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Erişime açık sayfalar
  const publicPages = ["/", "/login", "/admin", "/staff-login"];

  useEffect(() => {
    const checkSession = async () => {
      console.log("RouteProtection: Checking session...");
      
      // Mevcut sayfanın erişime açık olup olmadığını kontrol et
      const isPublicPage = publicPages.includes(location.pathname);
      
      // Kimlik doğrulaması gerekmeyen sayfalarda direkt göster
      if (isPublicPage) {
        console.log("RouteProtection: Public page, allowing access");
        setChecking(false);
        return;
      }
      
      // Oturum kontrolü yap
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("RouteProtection: Session error", error);
          navigate('/staff-login');
          return;
        }
        
        if (!data.session) {
          console.log("RouteProtection: No session, redirecting to login");
          navigate('/staff-login');
          return;
        }
        
        const userRole = data.session.user.user_metadata?.role;
        console.log("RouteProtection: User role", userRole);
        
        // Admin/personel kontrolü
        if (location.pathname.startsWith('/shop-') || location.pathname === '/shop-home') {
          if (userRole !== 'admin' && userRole !== 'staff') {
            console.log("RouteProtection: Not staff/admin, redirecting to login");
            navigate('/staff-login');
            return;
          }
        }
        
        console.log("RouteProtection: Access granted");
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
        navigate('/staff-login');
      } finally {
        setChecking(false);
      }
    };
    
    checkSession();
  }, [location.pathname, navigate]);

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
