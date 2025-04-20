import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          toast.error("Kullanıcı bilgileri alınamıyor");
          setLoading(false);
          return;
        }

        if (!user) {
          navigate("/login");
          return;
        }

        // Profil bilgilerini alıyoruz
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name, phone, gender, shopname")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast.error("Profil bilgileri alınırken bir hata oluştu.");
          setLoading(false);
          return;
        }

        if (profileData) {
          // Burada enum hatasını önlemek için role değerini normalize ediyoruz
          let normalizedRole = profileData.role;
          // Eğer role "isletmeci" ise "admin" veya uygun başka bir enum ile değiştiriyoruz
          if (normalizedRole === "isletmeci") {
            normalizedRole = "admin"; // veya "staff" olabilir, sisteminize göre ayarlayın
          }

          // Eğer profil tamamlanmışsa rolüne göre yönlendirme
          if (
            profileData.first_name &&
            profileData.last_name &&
            profileData.phone &&
            profileData.gender &&
            (normalizedRole === "admin" ? profileData.shopname : true)
          ) {
            if (normalizedRole === "admin") {
              navigate("/shop-home");
            } else if (normalizedRole === "staff") {
              navigate("/staff-profile");
            } else {
              // customer ya da diğer rollerin anasayfası
              navigate("/");
            }
          } else {
            // Profil tamamlanmamışsa bu sayfada kal
            setLoading(false);
          }
        } else {
          // Profil yoksa da kal
          setLoading(false);
        }
      } catch (error) {
        console.error("Oturum kontrolü sırasında hata:", error);
        toast.error("Sistem hatası oluştu");
        setLoading(false);
      }
    }

    checkUserProfile();
  }, [navigate]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  // Form ve profil tamamlamaya devam için UI burada olacak
  return (
    <div>
      {/* Profil tamamlama formu */}
      <h1>Profilinizi tamamlayın</h1>
      {/* ... form bileşenleri burada */}
    </div>
  );
}
