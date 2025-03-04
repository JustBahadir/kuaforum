
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
  const { isAuthenticated, userRole, loading } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically log out users when they return to home page if they were authenticated
    if (location.pathname === "/" && isAuthenticated) {
      const logoutUser = async () => {
        try {
          // Find a way to log out the user when they go to home page
          // This is a feature requested by the user
          // This can be implemented in a separate component or page
        } catch (error) {
          console.error("Auto logout error:", error);
        }
      };
      
      // We don't auto-logout here, we just notify the user they can use the logout button
      // as per user's latest request
      if (userRole === 'admin' || userRole === 'staff') {
        toast.info("Personel panelinden çıkmak için lütfen çıkış yapın");
      }
    }
    
    if (!loading) {
      if (shouldRedirect(isAuthenticated, userRole, location.pathname)) {
        const redirectPath = getRedirectPath(isAuthenticated, userRole, location.pathname);
        console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, loading]);

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 ml-3">Yükleniyor...</p>
      </div>
    );
  }

  return <>{children}</>;
};
