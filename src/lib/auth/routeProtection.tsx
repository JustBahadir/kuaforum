
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { shouldRedirect, getRedirectPath } from './routeProtection'; 
import { profileService } from './profileService';

interface RouteProtectionProps {
  children: ReactNode;
}

export function RouteProtection({ children }: RouteProtectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        setIsAuthenticated(!!session);
        
        if (session) {
          const role = await profileService.getUserRole();
          setUserRole(role);
          
          // Check if redirect is needed
          if (shouldRedirect(true, role, location.pathname)) {
            const redirectPath = getRedirectPath(true, role, location.pathname);
            navigate(redirectPath);
          }
        } else {
          // Not authenticated
          if (shouldRedirect(false, null, location.pathname)) {
            const redirectPath = getRedirectPath(false, null, location.pathname);
            navigate(redirectPath);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      if (session) {
        const role = await profileService.getUserRole();
        setUserRole(role);
        
        // Check if redirect is needed on auth state change
        if (shouldRedirect(true, role, location.pathname)) {
          const redirectPath = getRedirectPath(true, role, location.pathname);
          navigate(redirectPath);
        }
      } else {
        if (shouldRedirect(false, null, location.pathname)) {
          const redirectPath = getRedirectPath(false, null, location.pathname);
          navigate(redirectPath);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }

  return <>{children}</>;
}
