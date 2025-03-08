
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Sayfa yüklendiğinde mevcut oturum kontrolü
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Oturum kontrolü hatası:", error);
          setIsLoading(false);
          return;
        }
        
        if (data?.session) {
          const role = data.session.user.user_metadata?.role;
          if (role === 'staff' || role === 'admin') {
            console.log("Mevcut oturum bulundu, shop-home'a yönlendiriliyor.");
            navigate("/shop-home");
            return;
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setIsLoading(false);
      } finally {
        // Yükleme durumunu her durumda kapat
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleLoginSuccess = () => {
    console.log("Login başarılı, yönlendirme yapılıyor");
    toast.success("Başarıyla giriş yaptınız!");
    setTimeout(() => {
      navigate("/shop-home");
    }, 500);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={handleBackClick} />
        <CardContent className="p-6">
          <LoginTabs onSuccess={handleLoginSuccess} />
          <div className="flex flex-col items-center mt-4">
            <Button 
              variant="link" 
              onClick={handleBackClick}
              className="text-purple-600 hover:text-purple-800"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
