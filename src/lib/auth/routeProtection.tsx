
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { shouldRedirect, getRedirectPath } from './routeProtection.ts';

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
  const [showLoading, setShowLoading] = useState(true);

  // Yükleme ekranını 2 saniye sonra gizle
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Services sayfasında takılma durumunda ana sayfaya yönlendir
  useEffect(() => {
    if (location.pathname === '/services' && loading) {
      const redirectTimer = setTimeout(() => {
        console.log("Services sayfasında uzun süre bekleme tespit edildi, ana sayfaya yönlendiriliyor");
        navigate('/', { replace: true });
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [location.pathname, loading, navigate]);

  useEffect(() => {
    if (!loading) {
      if (shouldRedirect(isAuthenticated, userRole, location.pathname)) {
        const redirectPath = getRedirectPath(isAuthenticated, userRole, location.pathname);
        console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
        navigate(redirectPath);
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, loading]);

  // Yükleme göstergesini 2 saniye sonra gizle, yönlendirmeleri etkilememek için children'ı göster
  if (loading && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 text-purple-600 hover:text-purple-800 underline"
        >
          Ana Sayfaya Git
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// Re-export the utility functions to maintain backward compatibility
export { shouldRedirect, getRedirectPath } from './routeProtection.ts';
