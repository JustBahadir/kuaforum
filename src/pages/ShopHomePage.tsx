
import React, { useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useNavigate } from "react-router-dom";
import { useShopData } from "@/hooks/useShopData";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
// Removed duplicate import of useNavigate

export default function ShopHomePage() {
  const { userRole, dukkanId, userId, loading, refreshProfile } = useCustomerAuth();
  const navigate = useNavigate();

  // Ensure profile is fully loaded on initial render
  useEffect(() => {
    refreshProfile();
  }, []);

  // Yükleme sürecini kontrol et! loading true ise hiçbir şey render etme
  useEffect(() => {
    if (loading) return;
    
    // Make sure user roles are synced
    console.log("ShopHomePage checking role:", userRole, "dukkanId:", dukkanId);
    
    if (!userRole) {
      console.log("No user role, redirecting to login");
      navigate("/login");
      return;
    }
    
    if (userRole === "staff" && !dukkanId) {
      console.log("Staff without shop assignment, redirecting to unassigned-staff");
      navigate("/unassigned-staff", { replace: true });
      return;
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
    if (userRole === "admin") {
      return (
        <StaffLayout>
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Henüz bir işletme bulunamadı
              </h2>
              <p>İşletme oluşturmak için işletme ayarları sayfasını kullanabilirsiniz.</p>
              <button
                onClick={() => navigate("/shop-settings")}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                İşletme Oluştur
              </button>
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
