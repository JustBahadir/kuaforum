import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopContactCard } from "@/components/shop/ShopContactCard";
import { ShopWorkingHoursCard } from "@/components/shop/ShopWorkingHoursCard";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";
import { ShopPersonnelCard } from "@/components/shop/ShopPersonnelCard";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { dukkanServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button"; // Add the missing Button import

export default function ShopHomePage() {
  const { userRole, userId, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isletmeData, setIsletmeData] = useState<any>(null);
  const [personelListesi, setPersonelListesi] = useState<any[]>([]);
  const [calisma_saatleri, setCalisma_saatleri] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dukkanId, setDukkanId] = useState<number | null>(null);

  // First, get the current user's shop ID
  useEffect(() => {
    if (authLoading) return;

    const getUserDukkan = async () => {
      try {
        if (!userId) {
          navigate('/login');
          return;
        }

        // Check if user has a shop (is owner)
        const { data: dukkan, error: dukkanError } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', userId)
          .maybeSingle();
          
        if (dukkanError) {
          console.error("Error fetching owner's shop:", dukkanError);
        }
        
        if (dukkan && dukkan.id) {
          setDukkanId(dukkan.id);
          return;
        }
        
        // Check if user is staff
        const { data: personel, error: personelError } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', userId)
          .maybeSingle();
          
        if (personelError) {
          console.error("Error fetching staff's shop:", personelError);
        }
        
        if (personel && personel.dukkan_id) {
          setDukkanId(personel.dukkan_id);
          return;
        }
        
        // Check profile table as last resort
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('dukkan_id')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile dukkan_id:", profileError);
        }
        
        if (profile && profile.dukkan_id) {
          setDukkanId(profile.dukkan_id);
          return;
        }

        // No shop found
        if (userRole === 'admin') {
          // Admin without shop should create one
          setLoading(false);
        } else if (userRole === 'staff') {
          // Staff without shop assignment
          navigate('/unassigned-staff', { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in getUserDukkan:", err);
        setLoading(false);
      }
    };
    
    getUserDukkan();
  }, [userId, userRole, authLoading, navigate]);
  
  // Then, once we have dukkanId, load shop data
  useEffect(() => {
    if (!dukkanId) return;
    
    const loadShopData = async () => {
      try {
        setLoading(true);
        
        // Get shop data
        const shopData = await dukkanServisi.getirById(dukkanId);
        setIsletmeData(shopData);
        
        // Get personnel
        const { data: staffData, error: staffError } = await supabase
          .from('personel')
          .select('*, auth_id')
          .eq('dukkan_id', dukkanId);
          
        if (staffError) {
          throw staffError;
        }
        setPersonelListesi(staffData || []);
        
        // Get working hours
        const { data: hoursData, error: hoursError } = await supabase
          .from('calisma_saatleri')
          .select('*')
          .eq('dukkan_id', dukkanId)
          .order('gun_sira', { ascending: true });
          
        if (hoursError) {
          throw hoursError;
        }
        setCalisma_saatleri(hoursData || []);
        
      } catch (err: any) {
        console.error("Failed to load shop data:", err);
        setError(err.message || "İşletme bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    loadShopData();
  }, [dukkanId]);

  if (authLoading || loading) {
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
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (!isletmeData && userRole === 'admin') {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Henüz bir işletme bulunamadı
            </h2>
            <p>İşletme oluşturmak için işletme ayarları sayfasını kullanabilirsiniz.</p>
            <Button
              onClick={() => navigate("/shop-settings")}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              İşletme Oluştur
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {isletmeData && (
          <ShopProfileHeader
            shopData={isletmeData}
            isOwner={userRole === 'admin'}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            {isletmeData && <ShopContactCard isletmeData={isletmeData} />}
            <ShopWorkingHoursCard
              calisma_saatleri={calisma_saatleri}
              userRole={userRole}
              dukkanId={dukkanId}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ShopGalleryCard
              shopId={dukkanId}
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
