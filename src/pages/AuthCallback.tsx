
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
          toast.success("Giriş başarılı!");
          
          // Try to get user metadata first (avoid profiles table if possible)
          const userData = session.user;
          const userMetadata = userData.user_metadata || {};
          const role = userMetadata.role;
          
          console.log("User metadata:", userMetadata);
          console.log("User role from metadata:", role);
          
          // Only check profile if we need more information
          if (!userMetadata.phone || !userMetadata.gender || !role) {
            console.log("Metadata eksik, profil kontrolü yapılıyor...");
            
            try {
              // Direct SQL query to profiles using RPC to avoid RLS issues
              const { data: functionData, error: functionError } = await supabase.rpc(
                'get_current_user_role'
              );
              
              if (functionError) {
                console.error("RPC error:", functionError);
                // Fall back to direct auth.updateUser to set empty profile data
                await supabase.auth.updateUser({
                  data: {
                    role: 'customer', // Default role
                    phone: userMetadata.phone || '',
                    gender: userMetadata.gender || '',
                  }
                });
                
                // Redirect to profile completion
                console.log("Profil eksik, register-profile sayfasına yönlendiriliyor");
                toast.info("Lütfen profilinizi tamamlayın");
                navigate("/register-profile");
                return;
              }
              
              console.log("RPC response:", functionData);
              const profileData = functionData?.profile || {};
              const userRole = functionData?.role || 'customer';
              
              // If the profile is incomplete, redirect to complete profile
              if (!profileData.phone || !profileData.gender) {
                console.log("Profil eksik, register-profile sayfasına yönlendiriliyor");
                toast.info("Lütfen profilinizi tamamlayın");
                navigate("/register-profile");
                return;
              }
              
              console.log("Rol bazlı yönlendirme yapılıyor, rol:", userRole);
              
              // If the profile is complete, redirect based on role
              if (userRole === 'admin' || userRole === 'business_owner') {
                navigate("/shop-home");
              } else if (userRole === 'staff') {
                // Try to use the personel data already received from RPC
                const personnelData = functionData?.personnel || null;
                
                if (personnelData && personnelData.dukkan_id) {
                  navigate("/shop-home");
                } else {
                  navigate("/customer-dashboard");
                  toast.info("Henüz herhangi bir işletmeye atanmadınız.");
                }
              } else {
                navigate("/customer-dashboard");
              }
            } catch (profileError) {
              console.error("Profile fetch error:", profileError);
              
              // Redirect to profile completion as fallback
              console.log("Profil bilgisi alınamadı, register-profile sayfasına yönlendiriliyor");
              toast.info("Lütfen profilinizi tamamlayın");
              navigate("/register-profile");
            }
          } else {
            // We have all the info from metadata, redirect based on role
            console.log("Rol bazlı yönlendirme yapılıyor, rol:", role);
            
            if (role === 'admin' || role === 'business_owner') {
              navigate("/shop-home");
            } else if (role === 'staff') {
              // Check if user has shop info in metadata
              if (userMetadata.dukkan_id) {
                navigate("/shop-home");
              } else {
                // Try to get personnel info (this might be safe from RLS issues)
                try {
                  const { data: personelData, error: personelError } = await supabase
                    .from('personel')
                    .select('dukkan_id')
                    .eq('auth_id', session.user.id)
                    .maybeSingle(); // Using maybeSingle instead of single to avoid errors
                    
                  if (!personelError && personelData && personelData.dukkan_id) {
                    navigate("/shop-home");
                    return;
                  }
                } catch (e) {
                  console.error("Personnel check error:", e);
                }
                
                navigate("/customer-dashboard"); 
                toast.info("Henüz herhangi bir işletmeye atanmadınız.");
              }
            } else {
              navigate("/customer-dashboard");
            }
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
        
        // Add specific handling for the infinite recursion error
        if (err.message.includes('infinite recursion')) {
          toast.error("Supabase'de güvenlik politikalarında bir sorun oluştu. Site yöneticinize bildiriniz.");
          console.error("RLS Policy hatası - profiles tablosunda recursive policy sorunu");
        }
        
        // Redirect to login after error
        setTimeout(() => {
          navigate("/staff-login");
        }, 5000);
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
          <p className="text-red-600 mt-2">
            {error.includes('infinite recursion') 
              ? "Sistem yapılandırma hatası. Lütfen site yöneticisiyle iletişime geçin."
              : "Lütfen tarayıcı izinlerini kontrol edin ve tekrar deneyin."}
          </p>
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
