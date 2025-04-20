
import { useState } from "react";
import { profileService } from "@/lib/auth/profileService";
import { isletmeServisi } from "@/lib/supabase/services/dukkanServisi";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";

/**
 * Hook for managing user profile information
 */
export function useProfileManagement(
  userRole: string | null,
  isAuthenticated: boolean,
  setUserName: (name: string) => void
) {
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [dukkanAdi, setDukkanAdi] = useState<string | null>(null);

  /**
   * Refreshes user profile information
   */
  const refreshProfile = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (!user) {
        setUserName("Değerli Müşterimiz");
        return;
      }

      // Get role from user metadata for reliable role checking
      const role = user.user_metadata?.role || (await profileService.getUserRole());

      if (role === "admin") {
        try {
          const userShop = await isletmeServisi.kullanicininIsletmesi(user.id);
          if (userShop) {
            setDukkanId(userShop.id);
            setDukkanAdi(userShop.ad);
          } else if (
            location.pathname.includes("/personnel") ||
            location.pathname.includes("/appointments")
          ) {
            toast.error("İşletme bilgileriniz bulunamadı. Lütfen işletme bilgilerinizi oluşturun.");
            setTimeout(() => {
              window.location.href = "/create-shop";
            }, 2000);
          }
        } catch (error) {
          console.error("İşletme bilgisi alınırken hata:", error);
        }
      } else if (role === "staff") {
        try {
          const staffShop = await isletmeServisi.personelAuthIdIsletmesi(user.id);
          if (staffShop) {
            setDukkanId(staffShop.id);
            setDukkanAdi(staffShop.ad);
          } else {
            // Personel işletme yoksa sadece /staff-profile yönlendirme (toast ve hata mesajı yok)
            if (location.pathname !== "/staff-profile") {
              window.location.href = "/staff-profile";
            }
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

  /**
   * Reset all profile information
   */
  const resetProfile = () => {
    setDukkanId(null);
    setDukkanAdi(null);
  };

  return {
    dukkanId,
    dukkanAdi,
    refreshProfile,
    resetProfile,
  };
}
