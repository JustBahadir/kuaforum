
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/ui/button";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { QueryClient } from "@tanstack/react-query";
import { useShopData } from "@/hooks/useShopData";

export default function ShopHomePage() {
  const navigate = useNavigate();
  const { userRole, dukkanId } = useCustomerAuth();
  const queryClient = new QueryClient();
  
  const { 
    dukkanData, 
    loading, 
    error, 
    personelListesi, 
    calisma_saatleri 
  } = useShopData(dukkanId);
  
  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Bir hata oluştu</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (!dukkanData) {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Henüz bir dükkan bulunamadı</h2>
            <Button 
              onClick={() => navigate('/create-shop')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Dükkan Oluştur
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <ShopProfileHeader 
          dukkanData={dukkanData} 
          userRole={userRole} 
          queryClient={queryClient} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <ShopContactCard dukkanData={dukkanData} />
            <ShopWorkingHoursCard 
              calisma_saatleri={calisma_saatleri}
              userRole={userRole}
              dukkanId={dukkanId}
            />
          </div>
          
          <div className="lg:col-span-8 space-y-6">
            <ShopGalleryCard 
              dukkanId={dukkanData.id}
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
