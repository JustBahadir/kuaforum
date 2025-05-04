
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { DevreDisiBilesenSayfa } from "../utils/DisabledComponents";

// Rol türü tanımı
type KullaniciRol = "isletme_sahibi" | "personel" | null;

// Route koruması için prop tipi
interface RouteProtectionProps {
  children: React.ReactNode;
  allowedRoles?: KullaniciRol[];
  redirectPath?: string;
}

export const RouteProtection = ({
  children,
  allowedRoles = [],
  redirectPath = "/login"
}: RouteProtectionProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<KullaniciRol>(null);
  const [profilOK, setProfilOK] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate(redirectPath, { replace: true });
          return;
        }

        setUserId(session.user.id);

        // Kullanıcı profilini kontrol et
        const { data: kullaniciData, error: kullaniciError } = await supabase
          .from("kullanicilar")
          .select("rol, profil_tamamlandi")
          .eq("kimlik", session.user.id)
          .single();

        if (kullaniciError || !kullaniciData) {
          // Profil oluşturulmamış, profil kurulum sayfasına yönlendir
          navigate("/profil-kurulum", { replace: true });
          return;
        }

        setUserRole(kullaniciData.rol as KullaniciRol);
        setProfilOK(kullaniciData.profil_tamamlandi || false);

        // Profil tamamlanmamışsa profil kurulum sayfasına yönlendir
        if (!kullaniciData.profil_tamamlandi) {
          navigate("/profil-kurulum", { replace: true });
          return;
        }

        // Personel bilgilerini kontrol et
        if (kullaniciData.rol === "personel") {
          const { data: personelData, error: personelError } = await supabase
            .from("personeller")
            .select("*")
            .eq("kullanici_kimlik", session.user.id)
            .single();

          if (personelError) {
            console.error("Personel verileri alınamadı:", personelError);
            // Bu bir hata durumu, yine de devam et
          }

          // personelData null kontrolü eklendi
          if (personelData) {
            if (!personelData.dukkan_id) {
              navigate("/personel/atanmamis", { replace: true });
              return;
            }

            // Personelin başvuruları kontrol edilebilir
            const { data: basvuruData } = await supabase
              .from("personel_basvurulari")
              .select("*")
              .eq("kullanici_kimlik", session.user.id)
              .eq("durum", "beklemede");

            if (basvuruData && basvuruData.length > 0) {
              navigate("/personel/beklemede", { replace: true });
              return;
            }
          }
        }

        // Kullanıcının rolü sayfaya erişim için uygun mu kontrol et
        if (allowedRoles.length > 0 && !allowedRoles.includes(kullaniciData.rol as KullaniciRol)) {
          // Rol yetkisiz, ana sayfaya yönlendir
          navigate("/", { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        navigate(redirectPath, { replace: true });
      }
    };

    checkAuth();
  }, [navigate, redirectPath, allowedRoles]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  // Şimdilik sadece profil tamamlanmışsa ve rol uygunsa erişime izin ver
  // Bu yapı yeni tip eklemeleri için uygun olacak
  if (userRole && profilOK) {
    if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
      return <>{children}</>;
    }
  }

  // Geliştirme aşamasında geçici olarak içeriği göster
  return <DevreDisiBilesenSayfa />;
};
