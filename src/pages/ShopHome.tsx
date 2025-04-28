
import React, { useEffect, useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useNavigate } from "react-router-dom";
import { useShopData } from "@/hooks/useShopData";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { ShopCodeSection } from "@/components/shop/ShopCodeSection";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ShopHome() {
  const { userRole, dukkanId, userId, loading, refreshProfile } = useCustomerAuth();
  const [retryCounter, setRetryCounter] = useState(0);
  const navigate = useNavigate();
  const queryClient = new QueryClient();

  // Shop data hook
  const {
    isletmeData,
    loading: shopLoading,
    error,
    personelListesi,
    calisma_saatleri,
  } = useShopData(dukkanId);

  // Handle retries
  const handleRetry = () => {
    setRetryCounter(prev => prev + 1);
    refreshProfile();
  };

  // Redirect if no user role after loading is complete
  useEffect(() => {
    if (!loading && !userRole) {
      navigate("/login");
    }
    
    // Staff without shop assignment should be redirected
    if (!loading && userRole === "staff" && !dukkanId) {
      navigate("/unassigned-staff", { replace: true });
    }
  }, [userRole, loading, dukkanId, navigate]);

  // Render loading state
  if (loading || shopLoading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </StaffLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              İşletme bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Hata detayları: {error}</p>
            <Button 
              onClick={handleRetry} 
              className="flex items-center gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  // Render no business found state for admin users
  if (!isletmeData && userRole === "admin") {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <Alert className="mb-6">
            <AlertDescription>
              Henüz bir işletme bulunamadı. İşletme oluşturmak için aşağıdaki butona tıklayabilirsiniz.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Button
              onClick={() => navigate("/shop-settings")}
              className="mt-4"
            >
              İşletme Oluştur
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  // Return nothing for staff with no business
  if (!isletmeData) {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Bağlı olduğunuz bir işletme bulunamadı. Lütfen yöneticinizle iletişime geçiniz.
            </AlertDescription>
          </Alert>
        </div>
      </StaffLayout>
    );
  }

  // Main render with business information
  return (
    <QueryClientProvider client={queryClient}>
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
              
              {userRole === "admin" && (
                <ShopCodeSection 
                  shopId={isletmeData.id} 
                  shopName={isletmeData.ad} 
                />
              )}
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
    </QueryClientProvider>
  );
}
