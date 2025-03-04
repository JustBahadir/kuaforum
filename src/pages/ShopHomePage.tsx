
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Scissors, TrendingUp, Wallet } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";

export default function ShopHomePage() {
  const { userRole, dukkanId, dukkanAdi, refreshProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPersonnel, setTotalPersonnel] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProfile();
    
    const fetchDashboardData = async () => {
      if (!dukkanId) return;
      
      try {
        setLoading(true);
        
        // Fetch appointments for today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const appointments = await randevuServisi.getDukkanRandevulari(dukkanId, todayStr);
        setTodayAppointments(appointments.length);
        
        // Fetch total customers
        const customers = await musteriServisi.getDukkanMusterileri(dukkanId);
        setTotalCustomers(customers.length);
        
        // Fetch total personnel
        const personnel = await personelServisi.hepsiniGetir();
        const shopPersonnel = personnel.filter(p => p.dukkan_id === dukkanId);
        setTotalPersonnel(shopPersonnel.length);
        
        // Fetch total services
        const services = await islemServisi.dukkanIslemleri(dukkanId);
        setTotalServices(services.length);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dukkanId, refreshProfile]);
  
  const navigateTo = (path: string) => {
    navigate(path);
  };
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{dukkanAdi || "Kuaför Dükkanı"} Ana Sayfası</h1>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Randevular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{todayAppointments}</div>
                    <CalendarDays className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Müşteriler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{totalCustomers}</div>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Personel Sayısı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{totalPersonnel}</div>
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hizmet Sayısı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{totalServices}</div>
                    <Scissors className="h-5 w-5 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İşlemler</CardTitle>
                  <CardDescription>Sık kullanılan işlemler</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Button 
                    onClick={() => navigateTo("/appointments")} 
                    variant="outline" 
                    className="justify-start"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Randevuları Yönet
                  </Button>
                  
                  <Button 
                    onClick={() => navigateTo("/personnel")} 
                    variant="outline" 
                    className="justify-start"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Personel İşlemleri
                  </Button>
                  
                  <Button 
                    onClick={() => navigateTo("/services")} 
                    variant="outline" 
                    className="justify-start"
                  >
                    <Scissors className="mr-2 h-4 w-4" />
                    Hizmetleri Yönet
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performans Özeti</CardTitle>
                  <CardDescription>Dükkanınızın güncel durumu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Doluluk Oranı</span>
                    <span className="text-sm font-medium">%75</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm">Müşteri Memnuniyeti</span>
                    <span className="text-sm font-medium">%92</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  
                  <Button 
                    onClick={() => navigateTo("/shop-statistics")} 
                    variant="link" 
                    className="mt-2 p-0 h-auto justify-start text-sm"
                  >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Detaylı istatistikleri görüntüle
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dükkan Bilgileri</CardTitle>
                  <CardDescription>Hızlı erişim bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="text-sm font-medium">Dükkan Adı:</div>
                    <div className="text-sm">{dukkanAdi || "Ayarlanmadı"}</div>
                    
                    <div className="text-sm font-medium">Çalışma Saatleri:</div>
                    <div className="text-sm">09:00 - 19:00</div>
                    
                    <div className="text-sm font-medium">Telefon:</div>
                    <div className="text-sm">Ayarlanmadı</div>
                    
                    <div className="text-sm font-medium">Adres:</div>
                    <div className="text-sm">Ayarlanmadı</div>
                  </div>
                  
                  <Button 
                    onClick={() => navigateTo("/shop-settings")} 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    Dükkan Ayarlarını Düzenle
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
