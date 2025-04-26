
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  const publicPages = ["/", "/login", "/staff-login", "/services", "/appointments", "/auth", "/auth-google-callback"];

  useEffect(() => {
    let isMounted = true;
    let timeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        const isPublicPage = publicPages.some(page => 
          location.pathname === page || location.pathname.startsWith(`${page}/`)
        );
        
        if (isPublicPage) {
          if (isMounted) setChecking(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (isMounted) {
            navigate('/login');
          }
          return;
        }
        
        const userRole = session.user.user_metadata?.role;
        
        // Admin route check - allow shop-home if user is admin
        if (userRole === 'admin') {
          if (location.pathname === '/login' || location.pathname === '/staff-login') {
            navigate('/shop-home');
            return;
          }
        }
            
        if (userRole === 'staff') {
          const { data: personelData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', session.user.id)
            .maybeSingle();
          
          if (!personelData?.dukkan_id) {
            if (location.pathname !== '/unassigned-staff') {
              navigate('/unassigned-staff');
              return;
            }
          } else if (location.pathname === '/unassigned-staff') {
            navigate('/shop-home');
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
    
    timeout = setTimeout(() => {
      if (isMounted) setChecking(false);
    }, 2000);
    
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
