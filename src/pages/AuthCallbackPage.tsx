
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Home, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import AccountNotFound from "@/components/auth/AccountNotFound";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  
  // Google'dan dönen auth bilgisini işle
  useEffect(() => {
    const oturumKontrol = async () => {
      try {
        setYukleniyor(true);
        
        // Mevcut oturumu kontrol et
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setHata("Oturum bilgileri alınamadı");
          setYukleniyor(false);
          return;
        }
        
        if (!session) {
          console.log("No active session found");
          setHata("Kullanıcı bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
          setYukleniyor(false);
          return;
        }
        
        const kullaniciId = session.user.id;
        console.log("User authenticated with ID:", kullaniciId);
        
        // Kullanıcının mevcut profilini kontrol et
        const { data: kullanici, error: kullaniciHatasi } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("kimlik", kullaniciId)
          .maybeSingle();
        
        if (kullaniciHatasi && kullaniciHatasi.code !== 'PGRST116') {
          console.error("Kullanıcı verileri alınamadı:", kullaniciHatasi);
          setHata("Kullanıcı bilgilerinize erişilemedi");
          setYukleniyor(false);
          return;
        }
        
        // Kullanıcı bulunamadı - Hesap bulunamadı sayfasına yönlendir
        if (!kullanici) {
          console.log("No user profile found, showing account not found view");
          setAccountNotFound(true);
          setYukleniyor(false);
          return;
        }
        
        // Profil tamamlanmamışsa, profil kurulum sayfasına yönlendir
        if (!kullanici.profil_tamamlandi) {
          console.log("Profile not completed, redirecting to profile setup");
          navigate("/profil-kurulum", { replace: true });
          return;
        }
        
        // Profil tamamlanmışsa kullanıcı rolüne göre yönlendir
        console.log("User authenticated and profile completed, role:", kullanici.rol);
        
        if (kullanici.rol === "isletme_sahibi") {
          navigate("/isletme/anasayfa", { replace: true });
        } else if (kullanici.rol === "personel") {
          // Personelin atama durumunu kontrol et
          const { data: personel, error: personelHatasi } = await supabase
            .from("personel")
            .select("*")
            .eq("kullanici_kimlik", kullaniciId)
            .maybeSingle();
          
          if (personelHatasi) {
            console.error("Personel bilgileri alınamadı:", personelHatasi);
            setHata("Personel bilgilerinize erişilemedi");
            setYukleniyor(false);
            return;
          }
          
          if (!personel || personel.durum === "atanmadi") {
            navigate("/personel/atanmamis", { replace: true });
          } else if (personel.durum === "beklemede") {
            navigate("/personel/beklemede", { replace: true });
          } else {
            navigate("/personel/anasayfa", { replace: true });
          }
        } else {
          // Müşteri rolü için yönlendirme
          navigate("/musteri/anasayfa", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback hatası:", error);
        setHata("Bir hata oluştu. Lütfen tekrar giriş yapmayı deneyin.");
        setYukleniyor(false);
      }
    };
    
    oturumKontrol();
  }, [navigate]);

  if (accountNotFound) {
    return <AccountNotFound />;
  }

  if (accountExists) {
    return <AccountNotFound accountExists={true} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {yukleniyor ? (
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent mb-4" />
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
          
          <Button 
            className="w-full mt-2" 
            variant="outline"
            onClick={() => navigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-lg">Yönlendiriliyor...</p>
        </div>
      )}
    </div>
  );
}
