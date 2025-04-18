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
  
  const publicPages = ["/", "/login", "/register", "/staff-login", "/auth/callback"];

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        const isPublicPage = publicPages.some(page => 
          location.pathname === page || location.pathname.startsWith(`${page}/`)
        );
        
        if (isPublicPage) {
          if (isMounted) setChecking(false);
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          if (isMounted) {
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

        const { data: roleData, error: roleError } = await supabase.functions.invoke('get_current_user_role');
        
        if (roleError) {
          console.error("Error getting user role:", roleError);
          return;
        }

        const userRole = roleData?.role;
        
        // Role-based routing
        if (userRole === 'staff') {
          const personnelData = roleData?.personnel;
          
          if (!personnelData?.dukkan_id && location.pathname !== '/staff-profile') {
            navigate('/staff-profile');
            toast.info("Henüz bir işletmeye atanmadığınız için sadece profil sayfasına erişebilirsiniz.");
          }
        } else if (userRole === 'business_owner') {
          if (location.pathname === '/staff-profile') {
            navigate('/shop-home');
          }
        }
        
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("Route protection error:", error);
        if (isMounted) {
          setChecking(false);
          toast.error("Oturum kontrolü sırasında bir hata oluştu");
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  if (checking && !publicPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return <>{children}</>;
};
