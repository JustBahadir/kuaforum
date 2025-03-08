
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldRedirect, getRedirectPath } from '@/lib/auth/routeProtection';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface RouteProtectionProps {
  children: ReactNode;
}

/**
 * RouteProtection component to handle authentication redirection
 */
export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { isAuthenticated, userRole, loading } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLocalLoading, setShowLocalLoading] = useState(false);

  // Define public pages list
  const publicPages = [
    "/",
    "/login",
    "/admin",
    "/staff-login",
    "/services",
    "/appointments",
  ];

  // Helper function to check if current page is public
  const isPublicPage = () => {
    return publicPages.includes(location.pathname) || 
           location.pathname.startsWith("/services/") ||
           location.pathname.startsWith("/appointments/");
  };

  useEffect(() => {
    // Skip loading for public pages entirely
    if (isPublicPage()) {
      setShowLocalLoading(false);
      return;
    }

    // Simple loading logic
    if (loading) {
      setShowLocalLoading(true);
    } else {
      setShowLocalLoading(false);
    }
  }, [loading, location.pathname]);

  useEffect(() => {
    // Skip redirect checks for public pages
    if (isPublicPage()) {
      console.log("Genel erişimli sayfa, erişime izin verildi");
      return;
    }
    
    // Only perform redirects if not loading
    if (!loading) {
      if (shouldRedirect(isAuthenticated, userRole, location.pathname)) {
        const redirectPath = getRedirectPath(isAuthenticated, userRole, location.pathname);
        console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, loading]);

  // For public pages, never show loading screen
  if (isPublicPage()) {
    return <>{children}</>;
  }

  // For other pages, show loading only if needed
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
