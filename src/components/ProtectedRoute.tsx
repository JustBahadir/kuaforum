
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { KullaniciRol } from "@/lib/supabase/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: KullaniciRol[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      // Kullanıcı oturum açmamışsa veya rolü belirtilen rollerden biri değilse
      const authorized = !!user && !!userRole && allowedRoles.includes(userRole);
      setIsAuthorized(authorized);
    }
  }, [user, userRole, loading, allowedRoles]);

  // Yükleme durumunda bekle
  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Kullanıcı yetkili değilse ana sayfaya yönlendir
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Kullanıcı yetkili ise içeriği göster
  return <>{children}</>;
};

export default ProtectedRoute;
