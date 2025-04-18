
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useShopData } from "@/hooks/useShopData";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { ShopServicesCard } from "@/components/shop/ShopServicesCard";

export default function ShopHomePage() {
  const { dukkanId, userRole } = useCustomerAuth();
  const queryClient = useQueryClient();
  const { 
    dukkanData, 
    loading, 
    error, 
    personelListesi, 
    calisma_saatleri,
    services,
    isLoadingSaatler
  } = useShopData(dukkanId);

  // İşletme sahibi veya admin ise düzenleme yapabilir
  const canEdit = userRole === 'business_owner' || userRole === 'admin';

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex justify-center items-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {canEdit && (
          <div className="text-center mt-6">
            <Button onClick={() => window.location.href = "/create-shop"}>
              Dükkan Oluştur
            </Button>
          </div>
        )}
      </StaffLayout>
    );
  }

  if (!dukkanData) {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Dükkan bilgileri bulunamadı.</AlertDescription>
        </Alert>
        {canEdit && (
          <div className="text-center mt-6">
            <Button onClick={() => window.location.href = "/create-shop"}>
              Dükkan Oluştur
            </Button>
          </div>
        )}
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-6">
        <ShopProfileHeader 
          dukkanData={dukkanData} 
          userRole={userRole} 
          canEdit={canEdit}
          queryClient={queryClient} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ShopContactCard dukkanData={dukkanData} canEdit={canEdit} />
            <ShopWorkingHoursCard 
              calisma_saatleri={calisma_saatleri} 
              userRole={userRole}
              canEdit={canEdit}
              dukkanId={dukkanData.id}
            />
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <ShopGalleryCard 
              dukkanId={dukkanData.id} 
              userRole={userRole}
              canEdit={canEdit}
              queryClient={queryClient} 
            />
            <ShopPersonnelCard 
              personelListesi={personelListesi} 
              userRole={userRole}
              canEdit={canEdit}
            />
            <ShopServicesCard 
              services={services} 
              canEdit={canEdit} 
            />
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
