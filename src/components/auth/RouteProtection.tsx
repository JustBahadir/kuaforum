
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // Erişime açık sayfalar
  const publicPages = ["/", "/login", "/admin", "/staff-login"];

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      // Mevcut sayfanın erişime açık olup olmadığını kontrol et
      const isPublicPage = publicPages.some(page => 
        location.pathname === page || location.pathname.startsWith(`${page}/`)
      );
      
      // Kimlik doğrulaması gerekmeyen sayfaları doğrudan göster
      if (isPublicPage) {
        if (isMounted) setChecking(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          if (isMounted) navigate('/login');
          return;
        }
        
        const userRole = data.session.user.user_metadata?.role;
        
        // Admin/personel kontrolü
        if (location.pathname.startsWith('/shop-') || location.pathname === '/shop-home') {
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
    
    // Sadece korumalı sayfalarda kontrol yap
    if (!publicPages.includes(location.pathname)) {
      setChecking(true);
      checkSession();
    }
    
    // Cleanup
    return () => {
      isMounted = false;
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
