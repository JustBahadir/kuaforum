
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

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
          if (role === 'staff' || role === 'admin') {
            // Rota değişikliğinin tamamlanması için biraz zaman tanıyalım
            // ve ardından doğrudan navigasyon yapalım
            setTimeout(() => {
              console.log("Redirecting to shop-home from StaffLogin");
              navigate("/shop-home", { replace: true });
            }, 100);
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
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [navigate]);
  
  const handleLoginSuccess = () => {
    console.log("Login success detected, navigating to shop-home");
    // Başarılı girişten sonra doğrudan gezinme
    navigate("/shop-home", { replace: true });
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
