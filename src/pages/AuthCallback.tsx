
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleOAuthCallback = async () => {
      try {
        console.log("AuthCallback: OAuth callback işlemi başlatılıyor...");
        console.log("Current URL:", window.location.href);
        
        // Get the session to see if we're authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error(`Oturum bilgisi alınamadı: ${sessionError.message}`);
        }
        
        console.log("Session bilgisi:", session ? "Oturum var" : "Oturum yok");
        
        // Check if we have a valid session after callback
        if (session) {
          console.log("Kullanıcı bilgisi:", session.user.id);
          
          // Check if the user has a complete profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('phone, gender, role')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Profile check error:", profileError);
            throw new Error(`Profil bilgisi alınamadı: ${profileError.message}`);
          }
          
          console.log("Profil bilgisi:", profile);
          
          // If the profile is incomplete or doesn't exist, redirect to complete profile
          if (!profile || !profile.phone || !profile.gender || !profile.role) {
            console.log("Profil eksik, register-profile sayfasına yönlendiriliyor");
            toast.info("Lütfen profilinizi tamamlayın");
            navigate("/register-profile");
            return;
          }
          
          console.log("Rol bazlı yönlendirme yapılıyor, rol:", profile.role);
          
          // If the profile is complete, redirect based on role
          if (profile.role === 'admin' || profile.role === 'business_owner') {
            navigate("/shop-home");
          } else if (profile.role === 'staff') {
            // Check if staff is assigned to a shop
            const { data: personelData, error: personelError } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', session.user.id)
              .single();
              
            if (personelError) {
              console.error("Personel data error:", personelError);
              toast.error("Personel bilgileri alınamadı. Lütfen tekrar giriş yapın.");
              navigate("/staff-login");
              return;
            }
              
            if (personelData && personelData.dukkan_id) {
              navigate("/shop-home");
            } else {
              navigate("/customer-dashboard"); // This should be changed to profile page later
              toast.info("Henüz herhangi bir işletmeye atanmadınız.");
            }
          } else {
            navigate("/customer-dashboard");
          }
        } else {
          // No session, redirect to login
          console.log("Oturum bulunamadı, giriş sayfasına yönlendiriliyor");
          toast.error("Giriş yapılamadı. Lütfen tekrar deneyin.");
          navigate("/staff-login");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message);
        toast.error(`Giriş sırasında bir hata oluştu: ${err.message}`);
        // Redirect to login after error
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
