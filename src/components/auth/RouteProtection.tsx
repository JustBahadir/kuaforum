
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldRedirect, getRedirectPath } from '@/lib/auth/routeProtection';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

/**
 * RouteProtection component to handle authentication redirection
 */
export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { isAuthenticated, userRole, loading, handleLogout } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLocalLoading, setShowLocalLoading] = useState(false);
  const [localCheckTimeout, setLocalCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we need to show loading state for non-public pages
    const isPublicPage = 
      location.pathname === "/" || 
      location.pathname === "/login" || 
      location.pathname === "/admin" ||
      location.pathname === "/services" ||
      location.pathname === "/appointments";

    // Only show loading screen for non-public pages and only briefly
    if (!isPublicPage && loading) {
      // Set a very short timeout to show loading indicator
      const timeout = setTimeout(() => {
        setShowLocalLoading(true);
      }, 200); // Only show loading after 200ms delay
      
      setLocalCheckTimeout(timeout);
      
      // Set another timeout to force-clear loading state if it gets stuck
      const forceTimeout = setTimeout(() => {
        setShowLocalLoading(false);
        // Also do an additional auth check
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            console.log("Force redirecting to login page after timeout");
            navigate("/login");
          }
        });
      }, 3000); // Force clear loading state after 3 seconds max
      
      return () => {
        clearTimeout(timeout);
        clearTimeout(forceTimeout);
      };
    } else {
      setShowLocalLoading(false);
      if (localCheckTimeout) {
        clearTimeout(localCheckTimeout);
        setLocalCheckTimeout(null);
      }
    }
  }, [loading, location.pathname, navigate]);

  useEffect(() => {
    // Automatically log out users when they return to home page if they were authenticated
    if (location.pathname === "/" && isAuthenticated) {
      // We don't auto-logout here, we just notify the user they can use the logout button
      // as per user's request
      if (userRole === 'admin' || userRole === 'staff') {
        toast.info("Personel panelinden çıkmak için lütfen çıkış yapın");
      }
    }
    
    if (!loading) {
      // Check if redirection is needed
      if (shouldRedirect(isAuthenticated, userRole, location.pathname)) {
        const redirectPath = getRedirectPath(isAuthenticated, userRole, location.pathname);
        console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, loading, handleLogout]);

  // Don't show loading screen on public pages
  const isPublicPage = 
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname === "/admin" ||
    location.pathname === "/services" ||
    location.pathname === "/appointments";

  // For public pages, never show loading screen
  if (isPublicPage) {
    return <>{children}</>;
  }

  // For other pages, show loading only briefly
  if (showLocalLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return <>{children}</>;
};
