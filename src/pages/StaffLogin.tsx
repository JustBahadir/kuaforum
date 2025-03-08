
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [processingAuth, setProcessingAuth] = useState(false);
  
  // Oturumu tamamen sıfırlama fonksiyonu
  const resetAllAuth = async () => {
    try {
      setProcessingAuth(true);
      
      // Tüm Supabase oturumunu temizle
      await supabase.auth.signOut();
      
      // Yerel depolamayı temizle
      localStorage.clear();
      sessionStorage.clear();
      
      // Sayfayı yenile - en radikal çözüm
      toast.success("Oturum ve önbellek temizlendi, sayfa yenileniyor...");
      
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
      
    } catch (error) {
      console.error("Oturum sıfırlama hatası:", error);
      toast.error("Oturum temizlenirken bir hata oluştu");
    } finally {
      setProcessingAuth(false);
    }
  };
  
  // Check for any pending password resets or email confirmations
  useEffect(() => {
    const checkHash = async () => {
      setProcessingAuth(true);
      
      try {
        const hash = window.location.hash;
        
        // Handle password reset or email confirmation
        if (hash && (hash.includes("type=recovery") || hash.includes("type=signup"))) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            toast.error("Bağlantı geçersiz: " + error.message);
            setProcessingAuth(false);
          } else if (data.session) {
            if (hash.includes("type=recovery")) {
              toast.success("Şifre başarıyla değiştirildi");
            } else {
              toast.success("E-posta adresiniz doğrulandı");
            }
            navigate("/shop-home");
          } else {
            setProcessingAuth(false);
          }
        } else {
          setProcessingAuth(false);
        }
      } catch (error) {
        console.error("Hash check error:", error);
        setProcessingAuth(false);
      }
    };
    
    checkHash();

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        // Simple auth check with no timeout
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          setProcessingAuth(false);
          return;
        }
        
        if (sessionData.session) {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            console.error("User data fetch error:", error);
            setProcessingAuth(false);
            return;
          }
          
          if (data && data.user) {
            const metadata = data.user.user_metadata;
            // Check if user has staff or admin role
            if (metadata && (metadata.role === 'staff' || metadata.role === 'admin')) {
              navigate("/shop-home");
            } else {
              // User is not staff or admin, sign them out
              await supabase.auth.signOut();
              toast.error("Bu giriş sayfası sadece personel ve yöneticiler içindir.");
              setProcessingAuth(false);
            }
          } else {
            setProcessingAuth(false);
          }
        } else {
          setProcessingAuth(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setProcessingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLoginSuccess = () => {
    // Redirect to shop home page
    navigate("/shop-home");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (processingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <StaffCardHeader onBack={handleBackClick} />
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center h-40">
              <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Kimlik doğrulama işlemi sürüyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={handleBackClick} />
        <CardContent className="p-6">
          <LoginTabs onSuccess={handleLoginSuccess} />

          <div className="flex flex-col items-center mt-4 space-y-2">
            <Button 
              variant="link" 
              onClick={handleBackClick}
              className="text-purple-600 hover:text-purple-800"
            >
              Ana Sayfaya Dön
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={resetAllAuth}
              className="mt-4 flex items-center gap-1 text-sm"
              size="sm"
            >
              🔄 Oturumu Tamamen Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
