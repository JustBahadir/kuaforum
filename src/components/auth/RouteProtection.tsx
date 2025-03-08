
import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { isAuthenticated, userRole, loading } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Erişime açık sayfalar
  const publicPages = ["/", "/login", "/admin", "/staff-login"];

  // Mevcut sayfanın erişime açık olup olmadığını kontrol et
  const isPublicPage = publicPages.includes(location.pathname);

  // Kimlik doğrulaması gerekmeyen sayfalarda direkt göster
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Eğer yükleme devam ediyorsa basit bir loading göster
  if (loading) {
    return null;
  }

  // Oturum/rol kontrolü
  if (!isAuthenticated) {
    navigate('/staff-login');
    return null;
  }

  // Admin/personel kontrolü
  if (location.pathname.startsWith('/shop-') || location.pathname === '/shop-home') {
    if (userRole !== 'admin' && userRole !== 'staff') {
      navigate('/staff-login');
      return null;
    }
  }

  return <>{children}</>;
};
