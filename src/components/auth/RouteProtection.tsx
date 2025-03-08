
import React, { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldRedirect, getRedirectPath } from '@/lib/auth/routeProtection';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { toast } from 'sonner';

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

  // Very short timeout for auth check - if it takes longer than 500ms, just render the page
  // This prevents the infinite loading screen on login or homepage
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading && !isPublicPage) {
      timeoutId = setTimeout(() => {
        navigate('/login');
        toast.error("Oturum bilgisi alınamadı, lütfen tekrar giriş yapın");
      }, 500); // Reduced from 1000ms to 500ms for faster response
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, navigate, isPublicPage]);

  // If loading and not on a public page, show a brief loading spinner
  if (loading && !isPublicPage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  // For public pages or after loading, just render the children
  return <>{children}</>;
};
