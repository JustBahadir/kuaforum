
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  
  // Genel erişimli sayfalar
  const publicPages = ["/", "/login", "/register", "/staff-login", "/auth/callback"];

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        // Genel erişimli sayfa kontrolü
        const isPublicPage = publicPages.some(page => 
          location.pathname === page || location.pathname.startsWith(`${page}/`)
        );
        
        if (isPublicPage) {
          if (isMounted) setChecking(false);
          return;
        }
        
        // Oturum kontrolü
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (isMounted) {
            toast.error("Lütfen önce giriş yapın");
            navigate('/staff-login');
          }
          return;
        }
        
        // Profil tamamlama sayfası özel durum
        if (location.pathname === '/register-profile') {
          if (isMounted) setChecking(false);
          return;
        }

        try {
          // Edge function ile rol bilgisini al
          const { data: roleData, error: roleError } = await supabase.functions.invoke('get_current_user_role');
          
          if (roleError) {
            console.error("Rol bilgisi alınamadı:", roleError);
            if (isMounted) setChecking(false);
            return;
          }

          const userRole = roleData?.role;
          
          // Role göre yönlendirme
          if (userRole === 'staff') {
            const personnelData = roleData?.personnel;
            
            // Personel kullanıcı, dükkan atanmamışsa sadece staff-profile'a erişebilir
            if (!personnelData?.dukkan_id && 
                location.pathname !== '/staff-profile' &&
                location.pathname !== '/register-profile') {
              if (isMounted) {
                navigate('/staff-profile');
                toast.info("Henüz bir işletmeye atanmadığınız için sadece profil sayfasına erişebilirsiniz.");
              }
            }
          } else if (userRole === 'business_owner') {
            // İşletme sahibi, özel sayfalara erişim kontrolü
            // İşletme sahibi kullanıcılar shop-home ve ilgili sayfalara erişebilir
            const forbiddenPaths = ['/staff-profile'];
            
            if (forbiddenPaths.includes(location.pathname)) {
              if (isMounted) {
                navigate('/shop-home');
                toast.info("Bu sayfaya erişim yetkiniz yok.");
              }
            }
          }
        } catch (error) {
          console.error("Rol kontrolü hatası:", error);
        }
        
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("Rota koruma hatası:", error);
        if (isMounted) {
          setChecking(false);
          toast.error("Oturum kontrolü sırasında bir hata oluştu");
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  // Yükleme durumu göster
  if (checking && !publicPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return <>{children}</>;
};
