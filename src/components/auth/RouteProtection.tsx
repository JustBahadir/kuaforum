
import React, { ReactNode, useEffect, useState } from 'react';
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
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);

  // Set a timeout for loading to prevent infinite loading screen
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5-second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

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
      if (shouldRedirect(isAuthenticated, userRole, location.pathname)) {
        const redirectPath = getRedirectPath(isAuthenticated, userRole, location.pathname);
        console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, loading, handleLogout]);

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
        
        {loadingTimeout && (
          <div className="mt-6 text-center">
            <p className="text-red-500 mb-2">Yükleme uzun sürdü. Lütfen sayfayı yenileyin veya tekrar giriş yapın.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mr-2"
            >
              Sayfayı Yenile
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('supabase.auth.token');
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Tekrar Giriş Yap
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
