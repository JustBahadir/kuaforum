
import { useState } from "react";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { dukkanServisi, personelServisi } from "@/lib/supabase";
import { toast } from "sonner";

export function useProfileManagement(
  userRole: string | null,
  isAuthenticated: boolean,
  setUserName: (name: string) => void
) {
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [dukkanAdi, setDukkanAdi] = useState<string | null>(null);

  const refreshProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        setUserName("Değerli Müşterimiz");
        return;
      }

      // Get role from user metadata for reliable role checking
      const role = user.user_metadata?.role || await profileService.getUserRole();
      
      if (role === 'admin') {
        try {
          const userShop = await dukkanServisi.kullanicininIsletmesi(user.id);
          if (userShop) {
            setDukkanId(userShop.id);
            setDukkanAdi(userShop.ad);
          } else if (location.pathname.includes('/personnel') || location.pathname.includes('/appointments')) {
            toast.error("İşletme bilgileriniz bulunamadı. Lütfen işletme bilgilerinizi oluşturun.");
            
            setTimeout(() => {
              window.location.href = "/create-shop";
            }, 2000);
          }
        } catch (error) {
          console.error("İşletme bilgisi alınırken hata:", error);
        }
      } else if (role === 'staff') {
        try {
          const profile = await personelServisi.getirByAuthId(user.id);
          if (profile && profile.dukkan_id) {
            const shop = await dukkanServisi.getirById(profile.dukkan_id);
            if (shop) {
              setDukkanId(shop.id);
              setDukkanAdi(shop.ad);
            }
          } else if (location.pathname.includes('/personnel')) {
            toast.error("İşletme bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
          }
        } catch (error) {
          console.error("Personel işletme bilgisi alınırken hata:", error);
        }
      }
      
      const name = await profileService.getUserNameWithTitle();
      setUserName(name);
      
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const resetProfile = () => {
    setDukkanId(null);
    setDukkanAdi(null);
  };

  return {
    dukkanId,
    dukkanAdi,
    refreshProfile,
    resetProfile
  };
}
