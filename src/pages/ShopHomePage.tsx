
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/ui/button"; // Added Button import
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { ShopServicesCard } from "@/components/shop/ShopServicesCard";
import { QueryClient } from "@tanstack/react-query";

export default function ShopHomePage() {
  const navigate = useNavigate();
  const { refreshProfile, userRole, dukkanId } = useCustomerAuth();
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const queryClient = new QueryClient();
  
  useEffect(() => {
    const loadShopData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const userId = session.user.id;
        const userMetadata = session.user.user_metadata;
        const role = userMetadata?.role;

        if (role === 'admin') {
          const { data: shops, error } = await supabase
            .from('dukkanlar')
            .select('*')
            .eq('sahibi_id', userId)
            .limit(1);

          if (error) throw error;
          
          if (shops && shops.length > 0) {
            setShopData(shops[0]);
            
            const { data: hours } = await supabase
              .from('calisma_saatleri')
              .select('*')
              .eq('dukkan_id', shops[0].id)
              .order('gun_sira', { ascending: true });
              
            setWorkingHours(hours || []);
            
            const { data: staff } = await supabase
              .from('personel')
              .select('*')
              .eq('dukkan_id', shops[0].id);
              
            setPersonnel(staff || []);
          } else {
            navigate('/create-shop');
          }
        } else if (role === 'staff') {
          const { data: personel, error } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', userId)
            .maybeSingle();

          if (error) throw error;
          
          if (personel?.dukkan_id) {
            const { data: shop } = await supabase
              .from('dukkanlar')
              .select('*')
              .eq('id', personel.dukkan_id)
              .single();
              
            setShopData(shop);
            
            const { data: hours } = await supabase
              .from('calisma_saatleri')
              .select('*')
              .eq('dukkan_id', personel.dukkan_id)
              .order('gun_sira', { ascending: true });
              
            setWorkingHours(hours || []);
            
            const { data: staff } = await supabase
              .from('personel')
              .select('*')
              .eq('dukkan_id', personel.dukkan_id);
              
            setPersonnel(staff || []);
          } else {
            navigate('/staff-profile');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error loading shop data:", error);
        toast.error("Dükkan bilgileri yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    loadShopData();
  }, [navigate]);
  
  const refreshUserProfile = () => {
    refreshProfile();
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </StaffLayout>
    );
  }

  if (!shopData) {
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
      <div className="container mx-auto px-4 py-6">
        <ShopProfileHeader 
          dukkanData={shopData} 
          userRole={userRole} 
          queryClient={queryClient} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Contact and Gallery Section */}
          <div className="lg:col-span-4">
            <ShopContactCard dukkanData={shopData} />
          </div>
          
          <div className="lg:col-span-8">
            <ShopGalleryCard 
              dukkanId={shopData.id}
              userRole={userRole}
              queryClient={queryClient}
            />
          </div>

          {/* Working Hours, Personnel and Services Section */}
          <div className="lg:col-span-4">
            <ShopWorkingHoursCard 
              calisma_saatleri={workingHours}
              userRole={userRole}
              dukkanId={dukkanId}
            />
          </div>

          <div className="lg:col-span-4">
            <ShopPersonnelCard 
              personelListesi={personnel}
              userRole={userRole}
            />
          </div>

          <div className="lg:col-span-4">
            <ShopServicesCard />
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
