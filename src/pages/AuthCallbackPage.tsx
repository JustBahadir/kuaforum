
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user) {
          const { data: kullanici } = await supabase
            .from('kullanicilar')
            .select('rol, profil_tamamlandi')
            .eq('kimlik', data.user.id)
            .single();

          if (kullanici?.profil_tamamlandi) {
            // Kullanıcı profilini tamamlamış, rolüne göre yönlendir
            if (kullanici.rol === 'isletme_sahibi') {
              navigate('/isletme/anasayfa', { replace: true });
            } else if (kullanici.rol === 'personel') {
              navigate('/personel/anasayfa', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            // Kullanıcı profilini tamamlamamış, profil sayfasına yönlendir
            navigate('/profil-olustur', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Kimlik doğrulama sırasında bir hata oluştu.");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Hata</h2>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Giriş Yapılıyor</h2>
        <p className="text-muted-foreground">Lütfen bekleyin, yönlendiriliyorsunuz...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    </div>
  );
}
