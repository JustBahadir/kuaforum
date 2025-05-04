
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
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }

        if (data?.user) {
          // Check if user exists in our database
          const { data: existingUser, error: userCheckError } = await supabase
            .from('kullanicilar')
            .select('kimlik')
            .eq('kimlik', data.user.id)
            .single();
          
          if (userCheckError && userCheckError.code !== 'PGRST116') {
            console.error("User check error:", userCheckError);
            setError("Kullanıcı bilgileri kontrol edilirken bir hata oluştu.");
            return;
          }
          
          // If user doesn't exist, create a new user record
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('kullanicilar')
              .insert({
                kimlik: data.user.id,
                ad: data.user.user_metadata?.name?.split(' ')[0] || '',
                soyad: data.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
                eposta: data.user.email || '',
                profil_tamamlandi: false,
                rol: 'personel' // Default role, will be updated in profile setup
              });
              
            if (insertError) {
              console.error("User creation error:", insertError);
              setError("Kullanıcı kaydı oluşturulurken bir hata oluştu.");
              return;
            }
          }
          
          // Fetch user profile to check if it's completed
          const { data: kullanici } = await supabase
            .from('kullanicilar')
            .select('rol, profil_tamamlandi')
            .eq('kimlik', data.user.id)
            .single();

          if (kullanici?.profil_tamamlandi) {
            // User profile is complete, redirect based on role
            if (kullanici.rol === 'isletme_sahibi') {
              navigate('/isletme/anasayfa', { replace: true });
            } else if (kullanici.rol === 'personel') {
              // Check if personnel is assigned to a business
              const { data: personel } = await supabase
                .from('personeller')
                .select('isletme_kimlik, durum')
                .eq('kullanici_kimlik', data.user.id)
                .single();
              
              if (personel?.isletme_kimlik && personel.durum === "onaylandi") {
                navigate('/personel/anasayfa', { replace: true });
              } else if (personel?.durum === "beklemede") {
                navigate('/personel/beklemede', { replace: true });
              } else {
                navigate('/personel/atanmamis', { replace: true });
              }
            } else {
              navigate('/', { replace: true });
            }
          } else {
            // User profile is not complete, redirect to profile setup page
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
