
import React, { useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { QueryClient } from "@tanstack/react-query";
import { useShopData } from "@/hooks/useShopData";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { useNavigate } from "react-router-dom";

export default function ShopHomePage() {
  const { userRole, dukkanId, refreshProfile } = useCustomerAuth();
  const queryClient = new QueryClient();
  const navigate = useNavigate();

  const {
    isletmeData,
    loading,
    error,
    personelListesi,
    calisma_saatleri,
  } = useShopData(dukkanId);

  useEffect(() => {
    if (userRole === "staff" && !dukkanId) {
      // personel için işletme yoksa direkt staff profile sayfasına yönlendir
      navigate("/staff-profile", { replace: true });
    }
  }, [userRole, dukkanId, navigate]);

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </StaffLayout>
    );
  }

  // Hata varsa ve personel değilse göster, aksi halde gizle
  if (error) {
    if (userRole !== "staff") {
      return (
        <StaffLayout>
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Bir hata oluştu</h2>
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          </div>
        </StaffLayout>
      );
    }
  }

  // İşletme verisi yoksa ve personel değilse hata göster, personel ise boş dön
  if (!isletmeData) {
    if (userRole !== "staff") {
      return (
        <StaffLayout>
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Henüz bir işletme bulunamadı
              </h2>
            </div>
          </div>
        </StaffLayout>
      );
    }
    // personel için işletme yoksa zaten yukarı useEffect ile yönlendirme var
    return null;
  }

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <ShopProfileHeader isletmeData={isletmeData} userRole={userRole} queryClient={queryClient} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <ShopContactCard isletmeData={isletmeData} />
            <ShopWorkingHoursCard calisma_saatleri={calisma_saatleri} userRole={userRole} dukkanId={dukkanId} />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ShopGalleryCard isletmeId={isletmeData.id} userRole={userRole} queryClient={queryClient} />
            <ShopPersonnelCard personelListesi={personelListesi} userRole={userRole} />
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
