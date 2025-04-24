
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Home } from "lucide-react";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Sayfa yüklendiğinde mevcut oturum kontrolü
    const checkSession = async () => {
      try {
        console.log("StaffLogin: Checking session");
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          const role = data.session.user.user_metadata?.role;
          console.log("StaffLogin: User role", role);
          
          if (role === 'staff' || role === 'admin') {
            // Personel veya Admin rolündeki kullanıcıları kontrol edelim
            const userId = data.session.user.id;
            
            // Personel bir dükkan ile ilişkilendirilmiş mi kontrol edelim
            const { data: staffData } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', userId)
              .maybeSingle();
              
            console.log("StaffLogin: Staff shop data", staffData);
            
            if (role === 'staff' && (!staffData || !staffData.dukkan_id)) {
              // Personel henüz bir dükkan ile ilişkilendirilmemiş
              console.log("StaffLogin: Staff not assigned to shop, redirecting to unassigned-staff");
              navigate("/unassigned-staff", { replace: true });
              return;
            }
            
            // Doğrudan navigasyon - bekleme olmadan
            console.log("StaffLogin: Session active, redirecting to shop-home");
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
          <div className="flex flex-col items-center mt-4 space-y-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Müşteri Girişi</span>
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
