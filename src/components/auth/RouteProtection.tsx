
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { isAuthenticated, userRole, loading: authLoading } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Erişime açık sayfalar
  const publicPages = ["/", "/login", "/admin", "/staff-login"];

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      console.log("RouteProtection: Checking session for path:", location.pathname);
      
      // Mevcut sayfanın erişime açık olup olmadığını kontrol et
      const isPublicPage = publicPages.some(page => 
        location.pathname === page || location.pathname.startsWith(`${page}/`)
      );
      
      // Kimlik doğrulaması gerekmeyen sayfalarda direkt göster
      if (isPublicPage) {
        console.log("RouteProtection: Public page, allowing access");
        if (isMounted) setChecking(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("RouteProtection: Session error", error);
          navigate('/login'); // Önemli: Hata durumunda genel login sayfasına yönlendir
          if (isMounted) setChecking(false);
          return;
        }
        
        if (!data.session) {
          console.log("RouteProtection: No session, redirecting to login");
          navigate('/login'); // Oturum yoksa genel login sayfasına yönlendir
          if (isMounted) setChecking(false);
          return;
        }
        
        const userRole = data.session.user.user_metadata?.role;
        console.log("RouteProtection: User role", userRole);
        
        // Admin/personel kontrolü
        if (location.pathname.startsWith('/shop-') || location.pathname === '/shop-home') {
          if (userRole !== 'admin' && userRole !== 'staff') {
            console.log("RouteProtection: Not staff/admin, redirecting to staff login");
            navigate('/staff-login');
            if (isMounted) setChecking(false);
            return;
          }
        }
        
        console.log("RouteProtection: Access granted");
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
        if (isMounted) setChecking(false); // Hata durumunda bile checking'i false yap
      }
    };
    
    // Maksimum 5 saniye sonra yükleme durumunu sonlandır
    const timeoutId = setTimeout(() => {
      if (isMounted && checking) {
        console.log("RouteProtection: Timeout reached, ending checking state");
        setChecking(false);
      }
    }, 5000);
    
    checkSession();
    
    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
