
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  // Google'dan dönen auth bilgisini işle
  useEffect(() => {
    const oturumKontrol = async () => {
      try {
        setYukleniyor(true);
        
        // Mevcut oturumu kontrol et
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setHata("Kullanıcı bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
          return;
        }
        
        const kullaniciId = session.user.id;
        
        // Kullanıcının mevcut profilini kontrol et
        const { data: kullanici, error: kullaniciHatasi } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("kimlik", kullaniciId)
          .maybeSingle();
        
        if (kullaniciHatasi) {
          console.error("Kullanıcı verileri alınamadı:", kullaniciHatasi);
        }
        
        if (!kullanici) {
          // Kullanıcı daha önce kaydedilmemiş, yeni profil oluştur
          const { error: profilHatasi } = await supabase
            .from("kullanicilar")
            .insert([
              { 
                kimlik: kullaniciId,
                ad: session.user.user_metadata?.full_name?.split(' ')[0] || '',
                soyad: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                eposta: session.user.email,
                profil_tamamlandi: false
              }
            ]);
          
          if (profilHatasi) {
            console.error("Profil oluşturma hatası:", profilHatasi);
            setHata("Profiliniz oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.");
            return;
          }
          
          // Profil oluşturuldu, profil kurulum sayfasına yönlendir
          navigate("/profil-kurulum", { replace: true });
          return;
        }
        
        if (!kullanici.profil_tamamlandi) {
          // Profil mevcut ama tamamlanmamış, profil kurulum sayfasına yönlendir
          navigate("/profil-kurulum", { replace: true });
          return;
        }
        
        // Profil tamamlanmışsa kullanıcı rolüne göre yönlendir
        if (kullanici.rol === "isletme_sahibi") {
          navigate("/isletme/anasayfa", { replace: true });
        } else if (kullanici.rol === "personel") {
          // Personelin atama durumunu kontrol et
          const { data: personel, error: personelHatasi } = await supabase
            .from("personeller")
            .select("*")
            .eq("kullanici_kimlik", kullaniciId)
            .maybeSingle();
          
          if (personelHatasi || !personel) {
            navigate("/personel/atanmamis", { replace: true });
            return;
          }
          
          if (personel.durum === "atanmadi") {
            navigate("/personel/atanmamis", { replace: true });
          } else if (personel.durum === "beklemede") {
            navigate("/personel/beklemede", { replace: true });
          } else if (personel.durum === "onaylandi") {
            navigate("/personel/onaylandi", { replace: true });
          } else {
            navigate("/personel/atanmamis", { replace: true });
          }
        } else {
          // Default olarak ana sayfaya yönlendir
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback hatası:", error);
        setHata("Bir hata oluştu. Lütfen tekrar giriş yapmayı deneyin.");
      } finally {
        setYukleniyor(false);
      }
    };
    
    oturumKontrol();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {yukleniyor ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-lg">Giriş bilgileriniz işleniyor...</p>
        </div>
      ) : hata ? (
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{hata}</AlertDescription>
          </Alert>
          
          <Button 
            className="w-full" 
            onClick={() => navigate("/login")}
          >
            Giriş Sayfasına Dön
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-lg">Yönlendiriliyor...</p>
        </div>
      )}
    </div>
  );
}
