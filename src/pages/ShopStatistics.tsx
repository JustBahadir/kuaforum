
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CircleAlert, Info } from "lucide-react";

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("weekly");
  const [hasData, setHasData] = useState(false);
  
  const { data: islemler = [], isLoading: isLoadingIslemler } = useQuery({
    queryKey: ['personel-islemleri', dukkanId],
    queryFn: async () => {
      return await personelIslemleriServisi.hepsiniGetir();
    },
    enabled: !!dukkanId
  });

  const { data: randevular = [], isLoading: isLoadingRandevular } = useQuery({
    queryKey: ['randevular', dukkanId],
    queryFn: async () => {
      if (dukkanId) {
        return await randevuServisi.dukkanRandevulariniGetir(dukkanId);
      }
      return [];
    },
    enabled: !!dukkanId
  });

  // İşlemler ve randevulardan gerçek verileri hazırlama
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [servicePerformanceData, setServicePerformanceData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    customerCount: 0,
    operationCount: 0,
    averageSpending: 0
  });

  useEffect(() => {
    // Veriler yüklendikten sonra istatistikleri hesapla
    if (islemler.length > 0 || randevular.length > 0) {
      setHasData(true);
      
      // Toplam istatistikler - use actual operation amounts from islemler
      const totalRevenue = islemler.reduce((sum, islem) => sum + (Number(islem.tutar) || 0), 0);
      const customerCount = [...new Set(randevular.map(r => r.customer_id))].length;
      const operationCount = islemler.length;
      const averageSpending = customerCount > 0 ? totalRevenue / customerCount : 0;
      
      setSummaryData({
        totalRevenue,
        customerCount,
        operationCount,
        averageSpending
      });
      
      // Haftalık veriler
      const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const weeklyStats = weekDays.map(day => ({
        name: day,
        ciro: 0,
        musteri: 0
      }));
      
      // İşlemlerden haftalık verileri hesapla
      if (islemler.length > 0) {
        islemler.forEach(islem => {
          if (islem.created_at) {
            const date = new Date(islem.created_at);
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 0=Pazar -> 6, 1=Pazartesi -> 0
            weeklyStats[dayIndex].ciro += Number(islem.tutar) || 0;
            weeklyStats[dayIndex].musteri += 1;
          }
        });
      }
      
      setWeeklyData(weeklyStats);
      
      // Aylık veriler
      const monthlyStats = [
        { name: 'Hafta 1', ciro: 0, musteri: 0 },
        { name: 'Hafta 2', ciro: 0, musteri: 0 },
        { name: 'Hafta 3', ciro: 0, musteri: 0 },
        { name: 'Hafta 4', ciro: 0, musteri: 0 },
      ];
      
      // İşlemlerden aylık verileri hesapla
      if (islemler.length > 0) {
        islemler.forEach(islem => {
          if (islem.created_at) {
            const date = new Date(islem.created_at);
            const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
            if (weekOfMonth < 4) {
              monthlyStats[weekOfMonth].ciro += Number(islem.tutar) || 0;
              monthlyStats[weekOfMonth].musteri += 1;
            }
          }
        });
      }
      
      setMonthlyData(monthlyStats);
      
      // Hizmet performansı
      const serviceStats: Record<string, { count: number, revenue: number }> = {};
      
      islemler.forEach(islem => {
        const serviceName = islem.aciklama || 'Bilinmeyen Hizmet';
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { count: 0, revenue: 0 };
        }
        serviceStats[serviceName].count += 1;
        serviceStats[serviceName].revenue += Number(islem.tutar) || 0;
      });
      
      const servicePerformance = Object.keys(serviceStats).map(name => ({
        name,
        count: serviceStats[name].count,
        revenue: serviceStats[name].revenue
      }));
      
      setServicePerformanceData(servicePerformance);
    } else {
      setHasData(false);
    }
  }, [islemler, randevular]);

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dükkan İstatistikleri</h1>
        
        {!hasData && !isLoadingIslemler && !isLoadingRandevular && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Henüz veri bulunmuyor</AlertTitle>
            <AlertDescription>
              İstatistikler, yapılan işlemler ve randevular sonrasında otomatik olarak oluşturulacaktır.
              Önce birkaç randevu ve işlem girişi yapınız.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue={period} onValueChange={setPeriod} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
              <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Ciro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₺{summaryData.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {hasData ? "Güncel ciro bilgisi" : "Henüz veri yok"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Müşteri Sayısı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.customerCount}</div>
                <p className="text-xs text-muted-foreground">
                  {hasData ? "Toplam müşteri sayısı" : "Henüz veri yok"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  İşlem Sayısı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.operationCount}</div>
                <p className="text-xs text-muted-foreground">
                  {hasData ? "Toplam işlem sayısı" : "Henüz veri yok"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ortalama Harcama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₺{summaryData.averageSpending.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {hasData ? "Müşteri başına ortalama" : "Henüz veri yok"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Haftalık Performans</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="ciro" stroke="#8884d8" activeDot={{ r: 8 }} name="Ciro (₺)" />
                      <Line yAxisId="right" type="monotone" dataKey="musteri" stroke="#82ca9d" name="Müşteri Sayısı" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Henüz veri bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hizmet Performansı</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {hasData && servicePerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="İşlem Sayısı" />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Ciro (₺)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Henüz hizmet verisi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aylık Performans</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="ciro" stroke="#8884d8" activeDot={{ r: 8 }} name="Ciro (₺)" />
                      <Line yAxisId="right" type="monotone" dataKey="musteri" stroke="#82ca9d" name="Müşteri Sayısı" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Henüz veri bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="yearly">
            <Card>
              <CardHeader>
                <CardTitle>Veri Hazırlanıyor</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <CircleAlert className="h-4 w-4" />
                  <AlertTitle>Bilgi</AlertTitle>
                  <AlertDescription>
                    Yıllık istatistik verileri için yeterli veri bulunmuyor. Daha sonra tekrar kontrol edin.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
