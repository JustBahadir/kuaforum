
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

  // Public pages that don't require authentication
  const publicPages = [
    "/", 
    "/login", 
    "/staff-login", 
    "/services", 
    "/appointments", 
    "/auth", 
    "/auth-google-callback", 
    "/profile-setup"
  ];

  useEffect(() => {
    let isMounted = true;
    let timeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        // Check if current page is public
        const isPublicPage = publicPages.some(page => 
          location.pathname === page || location.pathname.startsWith(`${page}/`)
        );
        
        if (isPublicPage) {
          if (isMounted) setChecking(false);
          return;
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Redirect to login if no session
        if (!session) {
          if (isMounted) {
            navigate('/login');
          }
          return;
        }
        
        // Get user role from metadata
        const userRole = session.user.user_metadata?.role;
        
        // Admin route check
        if (userRole === 'admin') {
          if (location.pathname === '/login' || location.pathname === '/staff-login') {
            navigate('/shop-home');
            return;
          }
        }
        
        // Staff route check
        if (userRole === 'staff') {
          // Safely check personel data with null checks
          const { data: personelData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', session.user.id)
            .maybeSingle();
          
          // Add null check to prevent TypeScript errors
          if (personelData) {
            // If personel not assigned to a dukkan, redirect to unassigned staff page
            if (!personelData.dukkan_id && location.pathname !== '/unassigned-staff') {
              navigate('/unassigned-staff');
              return;
            } else if (personelData.dukkan_id && location.pathname === '/unassigned-staff') {
              // If personel assigned to a dukkan, redirect away from unassigned staff page
              navigate('/shop-home');
              return;
            }
          }
        }
        
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
        if (isMounted) setChecking(false);
      }
    };
    
    checkSession();
    
    // Fallback timeout in case something goes wrong
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
