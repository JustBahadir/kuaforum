
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // OAuth callback işleme
    const handleOAuthCallback = async () => {
      try {
        console.log("AuthCallback: OAuth callback işlemi başlatılıyor...");
        
        // Oturum kontrolü
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error(`Oturum bilgisi alınamadı: ${sessionError.message}`);
        }
        
        // Oturum varsa devam
        if (session) {
          console.log("Oturum var:", session.user.id);
          toast.success("Giriş başarılı!");
          
          try {
            // Edge function ile rol bilgisini al
            const { data: userData, error: roleError } = await supabase.functions.invoke('get_current_user_role');
            
            if (roleError) {
              console.error("Rol bilgisi alınamadı:", roleError);
              navigate("/register-profile");
              return;
            }
            
            const userRole = userData?.role;
            console.log("Kullanıcı rolü:", userRole);
            
            // Profil eksikse tamamlama sayfasına yönlendir
            const profileData = userData?.profile || {};
            if (!profileData.phone || !profileData.gender) {
              console.log("Profil eksik, tamamlama sayfasına yönlendiriliyor");
              toast.info("Lütfen profilinizi tamamlayın");
              navigate("/register-profile");
              return;
            }
            
            // Role göre yönlendirme
            if (userRole === 'business_owner' || userRole === 'admin') {
              navigate("/shop-home");
            } else if (userRole === 'staff') {
              // Personel bilgisine göre yönlendirme
              const personnelData = userData?.personnel || null;
              
              if (personnelData && personnelData.dukkan_id) {
                navigate("/shop-home");
              } else {
                navigate("/staff-profile");
                toast.info("Henüz herhangi bir işletmeye atanmadınız.");
              }
            } else {
              navigate("/customer-dashboard");
            }
          } catch (error) {
            console.error("Profil kontrolü hatası:", error);
            toast.info("Lütfen profilinizi tamamlayın");
            navigate("/register-profile");
          }
        } else {
          // Oturum yoksa giriş sayfasına yönlendir
          console.log("Oturum bulunamadı");
          toast.error("Giriş yapılamadı. Lütfen tekrar deneyin.");
          navigate("/staff-login");
        }
      } catch (err: any) {
        console.error("Auth callback hatası:", err);
        setError(err.message);
        
        // Hata durumunda kısa süre sonra giriş sayfasına yönlendir
        setTimeout(() => {
          navigate("/staff-login");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Giriş yapılıyor...</p>
        <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin, bilgileriniz doğrulanıyor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="bg-red-100 p-4 rounded-md mb-4 max-w-md">
          <p className="text-red-700">Bir hata oluştu: {error}</p>
        </div>
        <p>Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-lg">Yönlendiriliyor...</p>
    </div>
  );
}
