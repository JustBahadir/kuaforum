
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RouteProtectionProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function RouteProtection({ children, allowedRoles = [] }: RouteProtectionProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Oturum kontrolü
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Oturum yok, login sayfasına yönlendir
          navigate('/login', { replace: true });
          return;
        }
        
        setAuthenticated(true);
        
        // Kullanıcı profilini kontrol et
        const { data: kullanici, error: kullaniciHata } = await supabase
          .from("kullanicilar")
          .select("rol, profil_tamamlandi")
          .eq("kimlik", session.user.id)
          .maybeSingle();
        
        if (kullaniciHata && kullaniciHata.code !== 'PGRST116') {
          console.error("Kullanıcı verileri alınamadı:", kullaniciHata);
          
          // Try the older profiles table if kullanicilar fails
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, profil_tamamlandi")
            .eq("id", session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Profil verileri alınamadı:", profileError);
            setError("Kullanıcı bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
            return;
          }
          
          // If profile exists in the older table
          if (profile) {
            setUserRole(profile.role);
            
            // If profile is not completed, redirect to setup
            if (!profile.profil_tamamlandi) {
              navigate('/profil-kurulum', { replace: true });
              return;
            }
            
            // Check allowed roles
            if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
              setError("Bu sayfaya erişim izniniz bulunmamaktadır.");
              return;
            }
            
            // Everything is fine
            setLoading(false);
            return;
          }
          
          // If neither table has the user, redirect to profile setup
          navigate('/profil-kurulum', { replace: true });
          return;
        }
        
        // Kullanıcı profili yoksa kurulum sayfasına yönlendir
        if (!kullanici) {
          navigate('/profil-kurulum', { replace: true });
          return;
        }
        
        // Profil tamamlanmamışsa kurulum sayfasına yönlendir
        if (!kullanici.profil_tamamlandi) {
          navigate('/profil-kurulum', { replace: true });
          return;
        }
        
        setUserRole(kullanici.rol);
        
        // Eğer izin verilen roller belirtilmişse, kullanıcının rolünü kontrol et
        if (allowedRoles.length > 0 && !allowedRoles.includes(kullanici.rol)) {
          setError("Bu sayfaya erişim izniniz bulunmamaktadır.");
          return;
        }
      } catch (err) {
        console.error("Oturum kontrolü hatası:", err);
        setError("Bir hata oluştu. Lütfen tekrar giriş yapmayı deneyin.");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Yükleniyor...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }
  
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bu sayfaya erişmek için giriş yapmanız gerekmektedir.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full"
          >
            Giriş Sayfasına Git
          </Button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
