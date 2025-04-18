
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Home, ArrowLeft, Info } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Sayfa yüklendiğinde mevcut oturum kontrolü
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          const role = data.session.user.user_metadata?.role;
          if (role === 'staff' || role === 'admin' || role === 'business_owner') {
            // Doğrudan navigasyon - bekleme olmadan
            console.log("Oturum açık, hemen yönlendiriliyor...");
            navigate("/shop-home", { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error("StaffLogin: Beklenmeyen hata:", err);
        toast.error("Oturum kontrolü sırasında bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Yükleme ekranında sonsuz kalması durumuna karşı bir güvenlik önlemi
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [navigate]);
  
  const handleLoginSuccess = () => {
    console.log("Login success detected");
    // Başarılı girişten sonra doğrudan yönlendirme - bekleme olmadan
    console.log("Hemen yönlendirme yapılıyor: /shop-home");
    navigate("/shop-home", { replace: true });
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg p-6">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackClick}
              className="text-white hover:text-white/80 hover:bg-white/10 absolute top-0 left-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-center mb-1">Kuaför Girişi</h1>
            <p className="text-sm text-center text-white/80">Hesabınıza giriş yapın</p>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 z-10"
                      >
                        <Info className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Geliştirici hesabı için e-posta ile giriş aktif. Yeni kayıtlar yalnızca Google hesabıyla yapılabilir.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <GoogleAuthButton mode="signin" className="mb-4" />
                
                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <div className="px-3 text-sm text-gray-500">veya</div>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
            </div>
            
            <LoginTabs onSuccess={handleLoginSuccess} />
          </div>
          
          <div className="flex flex-col items-center mt-4 space-y-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/register")}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Yeni Hesap Oluştur</span>
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleBackClick}
              className="w-full flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Ana Sayfaya Dön</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
