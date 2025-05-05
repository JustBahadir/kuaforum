
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Kullanici } from "@/lib/supabase/types";
import { Profil } from "@/lib/supabase/temporaryTypes";
import { Loader2 } from "lucide-react";

interface RouteProtectionProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oturumVar, setOturumVar] = useState(false);
  const [kullanici, setKullanici] = useState<Kullanici | Profil | null>(null);
  const location = useLocation();

  useEffect(() => {
    const oturumKontrol = async () => {
      try {
        // Mevcut oturumu kontrol et
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Oturum yok, giriş sayfasına yönlendiriliyorsunuz...");
          setYukleniyor(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Kullanıcı bilgilerini al
        const { data: userData, error: userError } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("kimlik", userId)
          .maybeSingle();
        
        if (userError) {
          console.error("Kullanıcı bilgileri alınamadı:", userError);
          setYukleniyor(false);
          return;
        }
        
        // Profil bilgileri alınamadıysa veya profil tamamlanmadıysa setup sayfasına yönlendir
        if (!userData) {
          console.log("Profil bulunamadı, profil kurulum sayfasına yönlendiriliyorsunuz...");
          setYukleniyor(false);
          return;
        }
        
        if (!userData.profil_tamamlandi) {
          console.log("Profil tamamlanmamış, profil kurulum sayfasına yönlendiriliyorsunuz...");
          setYukleniyor(false);
          return;
        }
        
        // Rol kontrolü yap (eğer belirli roller için kısıtlama varsa)
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = userData.rol;
          
          if (!userRole || !allowedRoles.includes(userRole)) {
            console.log("Yetkisiz erişim, izin verilen roller:", allowedRoles, "kullanıcı rolü:", userRole);
            setYukleniyor(false);
            return;
          }
        }
        
        // Personel için ek kontroller
        if (userData.rol === "personel") {
          try {
            // Personel kaydı mevcut mu kontrol et
            const { data: personelData } = await supabase
              .from("personeller")
              .select("*")
              .eq("kullanici_kimlik", userId)
              .maybeSingle();
            
            // Personel ise durum kontrolü yap
            if (personelData && personelData.dukkan_id) {
              // Personel bir işletmeye atanmış
              console.log("Personel işletmeye atanmış");
            } else {
              // Personel henüz bir işletmeye atanmamış
              console.log("Personel henüz bir işletmeye atanmamış");
            }
          } catch (error) {
            console.error("Personel bilgileri alınamadı:", error);
          }
        }
        
        setOturumVar(true);
        setKullanici(userData as any); // Tip dönüşümü yaparak TypeScript hatasını önle
        
      } catch (error) {
        console.error("Oturum kontrolü sırasında bir hata oluştu:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    oturumKontrol();
  }, [allowedRoles]);

  // Yükleme durumu
  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Kullanıcı bilgileri kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Oturum yoksa login sayfasına yönlendir
  if (!oturumVar || !kullanici) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profil tamamlanmamışsa profil kurulum sayfasına yönlendir
  if (kullanici && !(kullanici as any).profil_tamamlandi) {
    return <Navigate to="/profil-kurulum" replace />;
  }

  // İzin verilen roller belirtilmişse ve kullanıcının rolü bu listede değilse ana sayfaya yönlendir
  if (
    allowedRoles && 
    allowedRoles.length > 0 && 
    kullanici && 
    (!(kullanici as any).rol || !allowedRoles.includes((kullanici as any).rol))
  ) {
    return <Navigate to="/" replace />;
  }

  // Yetki kontrolünü geçtiyse içeriği göster
  return <>{children}</>;
};
