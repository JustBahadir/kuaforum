
import { useState } from "react";
import { profileService } from "@/lib/auth/profileService";
import { dukkanServisi } from "@/lib/supabase"; // Updated import
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
      const role = user.user_metadata?.role || await profileService.getUserRole();
      
      if (role === 'admin') {
        try {
          // Use dukkanServisi instead of isletmeServisi
          const userShop = await dukkanServisi.kullanicininIsletmesi(user.id);
          if (userShop) {
            setDukkanId(userShop.id);
            setDukkanAdi(userShop.ad);
          } else if (location.pathname.includes('/personnel') || location.pathname.includes('/appointments')) {
            // Önce toast göster, sonra işletme oluşturma sayfasına yönlendir
            toast.error("İşletme bilgileriniz bulunamadı. Lütfen işletme bilgilerinizi oluşturun.");
            
            // Kısa bir gecikme ekleyelim ki toast görülebilsin
            setTimeout(() => {
              window.location.href = "/create-shop";
            }, 2000);
          }
        } catch (error) {
          console.error("İşletme bilgisi alınırken hata:", error);
        }
      } else if (role === 'staff') {
        try {
          // Use dukkanServisi instead of isletmeServisi
          const staffShop = await dukkanServisi.personelAuthIdIsletmesi(user.id);
          if (staffShop) {
            // Make sure we're properly handling the returned data
            if (typeof staffShop === 'object' && staffShop !== null) {
              setDukkanId(staffShop.id);
              setDukkanAdi(staffShop.ad);
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
    resetProfile
  };
}
