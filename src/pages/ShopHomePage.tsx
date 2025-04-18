
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShopServicesCard } from "@/components/shop/ShopServicesCard";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function ShopHomePage() {
  const navigate = useNavigate();
  const { refreshProfile, userRole, dukkanId, dukkanAdi } = useCustomerAuth();
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  
  useEffect(() => {
    const loadShopData = async () => {
      try {
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const userId = session.user.id;
        const userMetadata = session.user.user_metadata;
        const role = userMetadata?.role;

        // Load shop data based on role
        if (role === 'admin') {
          // Admin: fetch shop owned by user
          const { data: shops, error } = await supabase
            .from('dukkanlar')
            .select('*')
            .eq('sahibi_id', userId)
            .limit(1);

          if (error) throw error;
          
          if (shops && shops.length > 0) {
            setShopData(shops[0]);
            
            // Load working hours
            const { data: hours } = await supabase
              .from('calisma_saatleri')
              .select('*')
              .eq('dukkan_id', shops[0].id)
              .order('gun_sira', { ascending: true });
              
            setWorkingHours(hours || []);
            
            // Load personnel
            const { data: staff } = await supabase
              .from('personel')
              .select('*')
              .eq('dukkan_id', shops[0].id);
              
            setPersonnel(staff || []);
          } else {
            // No shop found, show creation screen
            navigate('/create-shop');
          }
        } else if (role === 'staff') {
          // Staff: fetch shop they work for
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
            
            // Load working hours
            const { data: hours } = await supabase
              .from('calisma_saatleri')
              .select('*')
              .eq('dukkan_id', personel.dukkan_id)
              .order('gun_sira', { ascending: true });
              
            setWorkingHours(hours || []);
            
            // Load personnel
            const { data: staff } = await supabase
              .from('personel')
              .select('*')
              .eq('dukkan_id', personel.dukkan_id);
              
            setPersonnel(staff || []);
          } else {
            // No shop found, redirect to profile
            navigate('/staff-profile');
          }
        } else {
          // Not admin or staff
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
  
  // Function to refresh user profile
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
          <Card className="border rounded-lg p-6 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-semibold mb-4">Henüz bir dükkan bulunamadı</h2>
              {userRole === 'admin' ? (
                <>
                  <p className="text-gray-600 mb-6">Dükkanınızı oluşturmak için aşağıdaki butona tıklayın.</p>
                  <Button 
                    onClick={() => navigate('/create-shop')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Dükkan Oluştur
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">Bir dükkana bağlanmak için profil sayfanızı ziyaret edin.</p>
                  <Button onClick={() => navigate('/staff-profile')}>
                    Profilime Git
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Salon Yönetim Sayfası</h1>
          
          <Button
            onClick={refreshUserProfile}
            variant="outline"
            size="sm"
          >
            Bilgileri Yenile
          </Button>
        </div>

        {/* Shop Profile Section */}
        <Card className="bg-purple-50 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:w-1/4">
                <div className="w-full aspect-square rounded-lg bg-white flex items-center justify-center overflow-hidden border">
                  {shopData.logo_url ? (
                    <img 
                      src={shopData.logo_url} 
                      alt={shopData.ad} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store size={64} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{shopData.ad}</h2>
                <p className="text-gray-600 mb-4">{shopData.adres || shopData.acik_adres}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/shop-settings')}
                  >
                    Dükkan Bilgilerini Düzenle
                  </Button>
                  
                  {userRole === 'admin' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/personnel')}
                    >
                      Personel Yönetimi
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                    onClick={() => navigate('/appointments')}
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Randevular</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                    onClick={() => navigate('/customers')}
                  >
                    <Users className="h-6 w-6" />
                    <span>Müşteriler</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                    onClick={() => navigate('/admin/operations')}
                  >
                    <Scissors className="h-6 w-6" />
                    <span>Hizmetler</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                    onClick={() => navigate('/operations-history')}
                  >
                    <FileText className="h-6 w-6" />
                    <span>İşlem Geçmişi</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Gallery Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dükkan Galerisi</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/shop-settings')}>
                  Medya Ekle
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Sample gallery item */}
                  <div className="aspect-square rounded-md overflow-hidden border">
                    <img 
                      src="/placeholder-salon.jpg" 
                      alt="Salon" 
                      onError={(e) => {
                        // Set a fallback when image fails to load
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/e9ecef/6c757d?text=G%C3%B6rsel';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Empty upload spots */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div 
                      key={index}
                      className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-gray-50"
                    >
                      <div className="text-gray-400 text-center">
                        <span className="block text-3xl">+</span>
                        <span className="text-xs">Fotoğraf Ekle</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Working Hours */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Çalışma Saatleri</CardTitle>
                {userRole === 'admin' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/shop-settings')}
                  >
                    Düzenle
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workingHours && workingHours.length > 0 ? (
                    workingHours.map((day) => (
                      <div key={day.id} className="flex justify-between items-center">
                        <span className="font-medium">{day.gun}</span>
                        <span>
                          {day.kapali 
                            ? <span className="text-red-500">KAPALI</span>
                            : `${day.acilis || '--:--'} - ${day.kapanis || '--:--'}`
                          }
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-2">
                      Çalışma saatleri henüz ayarlanmamış
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personnel List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Uzman Personeller</CardTitle>
                {userRole === 'admin' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/personnel')}
                  >
                    Personel Yönetimi
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {personnel && personnel.length > 0 ? (
                  <div className="space-y-3">
                    {personnel.map((person) => (
                      <div key={person.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {person.avatar_url ? (
                            <img 
                              src={person.avatar_url} 
                              alt={person.ad_soyad} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {person.ad_soyad.split(' ').map((part: string) => part[0]).join('').toUpperCase().substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{person.ad_soyad}</p>
                          <p className="text-sm text-gray-500">Personel</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">
                    Henüz personel eklenmemiş
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Services Summary */}
            <ShopServicesCard />
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
