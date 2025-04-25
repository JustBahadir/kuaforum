
import React, { useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useNavigate } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { useShopData } from "@/hooks/useShopData";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { useNavigate } from "react-router-dom";

export default function ShopHomePage() {
  const { userRole, dukkanId, userId, loading } = useCustomerAuth();
  const queryClient = new QueryClient();
  const navigate = useNavigate();

  // Yükleme sürecini kontrol et! loading true ise hiçbir şey render etme
  useEffect(() => {
    if (loading) return;
    if (userRole === undefined || userRole === null) return; // still waiting
    if (userRole === "staff" && !dukkanId) {
      navigate("/staff-profile", { replace: true });
    }
    if (!userRole) {
      navigate("/login");
    }
  }, [userRole, dukkanId, navigate, loading]);

  const {
    isletmeData,
    loading: shopLoading,
    error,
    personelListesi,
    calisma_saatleri,
  } = useShopData(dukkanId);

  if (loading || shopLoading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </StaffLayout>
    );
  }

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
    return null; // personel için işletme yoksa null
  }

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <ShopProfileHeader
          isletmeData={isletmeData}
          userRole={userRole}
          queryClient={queryClient}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <ShopContactCard isletmeData={isletmeData} />
            <ShopWorkingHoursCard
              calisma_saatleri={calisma_saatleri}
              userRole={userRole}
              dukkanId={dukkanId}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ShopGalleryCard
              isletmeId={isletmeData.id}
              userRole={userRole}
              queryClient={queryClient}
            />
            <ShopPersonnelCard
              personelListesi={personelListesi}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
