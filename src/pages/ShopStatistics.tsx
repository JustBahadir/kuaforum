
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { personelServisi } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CircleAlert, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("weekly");
  const [hasData, setHasData] = useState(false);
  
  const { data: personeller = [], isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ['personel-list'],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !!dukkanId
  });

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
  const [personnelPerformanceData, setPersonnelPerformanceData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    customerCount: 0,
    operationCount: 0,
    averageSpending: 0,
    completedAppointments: 0
  });

  const isLoading = isLoadingIslemler || isLoadingRandevular || isLoadingPersoneller;

  useEffect(() => {
    // Veriler yüklendikten sonra istatistikleri hesapla
    if (!isLoading) {
      setHasData(islemler.length > 0 || randevular.length > 0);
      
      // Toplam istatistikler
      const totalRevenue = islemler.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
      const customerCount = [...new Set(randevular.map(r => r.musteri_id).filter(Boolean))].length;
      const operationCount = islemler.length;
      const averageSpending = customerCount > 0 ? totalRevenue / customerCount : 0;
      const completedAppointments = randevular.filter(r => r.durum === 'tamamlandi').length;
      
      setSummaryData({
        totalRevenue,
        customerCount,
        operationCount,
        averageSpending,
        completedAppointments
      });
      
      // Haftalık veriler
      const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const weeklyStats = weekDays.map(day => ({
        name: day,
        ciro: 0,
        musteri: 0
      }));
      
      // İşlemlerden haftalık verileri hesapla
      islemler.forEach(islem => {
        if (islem.created_at) {
          const date = new Date(islem.created_at);
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 0=Pazar -> 6, 1=Pazartesi -> 0
          weeklyStats[dayIndex].ciro += islem.tutar || 0;
          weeklyStats[dayIndex].musteri += 1;
        }
      });
      
      setWeeklyData(weeklyStats);
      
      // Aylık veriler
      const monthlyStats = [
        { name: 'Hafta 1', ciro: 0, musteri: 0 },
        { name: 'Hafta 2', ciro: 0, musteri: 0 },
        { name: 'Hafta 3', ciro: 0, musteri: 0 },
        { name: 'Hafta 4', ciro: 0, musteri: 0 },
      ];
      
      // İşlemlerden aylık verileri hesapla
      islemler.forEach(islem => {
        if (islem.created_at) {
          const date = new Date(islem.created_at);
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
          if (weekOfMonth < 4) {
            monthlyStats[weekOfMonth].ciro += islem.tutar || 0;
            monthlyStats[weekOfMonth].musteri += 1;
          }
        }
      });
      
      setMonthlyData(monthlyStats);
      
      // Hizmet performansı istatistikleri
      const serviceStats: Record<string, { count: number, revenue: number }> = {};
      
      islemler.forEach(islem => {
        const serviceName = islem.aciklama ? 
          (islem.aciklama.includes(' hizmeti verildi') ? 
            islem.aciklama.split(' hizmeti verildi')[0] : 
            islem.aciklama) : 
          'Bilinmeyen Hizmet';
            
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { count: 0, revenue: 0 };
        }
        serviceStats[serviceName].count += 1;
        serviceStats[serviceName].revenue += islem.tutar || 0;
      });
      
      const servicePerformance = Object.keys(serviceStats).map(name => ({
        name,
        count: serviceStats[name].count,
        revenue: serviceStats[name].revenue
      })).sort((a, b) => b.revenue - a.revenue);
      
      setServicePerformanceData(servicePerformance);
      
      // Personel performans istatistikleri
      const personnelPerformance = personeller.map(personel => {
        const personelIslemleri = islemler.filter(islem => islem.personel_id === personel.id);
        const totalRevenue = personelIslemleri.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
        const operationCount = personelIslemleri.length;
        
        return {
          name: personel.ad_soyad,
          ciro: totalRevenue,
          islemSayisi: operationCount,
          prim: personelIslemleri.reduce((sum, islem) => sum + (islem.odenen || 0), 0)
        };
      }).filter(item => item.islemSayisi > 0);
      
      setPersonnelPerformanceData(personnelPerformance);
    }
  }, [islemler, randevular, personeller, isLoading, dukkanId]);

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dükkan İstatistikleri</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : !hasData ? (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Henüz veri bulunmuyor</AlertTitle>
            <AlertDescription>
              İstatistikler, yapılan işlemler ve randevular sonrasında otomatik olarak oluşturulacaktır.
              Önce birkaç randevu ve işlem girişi yapınız.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue={period} onValueChange={setPeriod} className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                <TabsTrigger value="monthly">Aylık</TabsTrigger>
                <TabsTrigger value="yearly">Yıllık</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Ciro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Güncel ciro bilgisi
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
                    Toplam müşteri sayısı
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
                    Toplam işlem sayısı
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
                  <div className="text-2xl font-bold">{formatCurrency(summaryData.averageSpending)}</div>
                  <p className="text-xs text-muted-foreground">
                    Müşteri başına ortalama
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tamamlanan Randevular
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryData.completedAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    Toplam tamamlanan randevu
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <TabsContent value="weekly" className="space-y-4">
              {/* Haftalık Performans Grafiği */}
              <Card>
                <CardHeader>
                  <CardTitle>Haftalık Performans</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="ciro" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Ciro (₺)" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="musteri" 
                        stroke="#82ca9d" 
                        name="Müşteri Sayısı" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Hizmet Performansı */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hizmet Performansı</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {servicePerformanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={servicePerformanceData.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === 'revenue') return formatCurrency(value);
                              return value;
                            }}
                          />
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
                
                {/* Personel Performansı */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personel Performansı</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {personnelPerformanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={personnelPerformanceData}
                            dataKey="ciro"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {personnelPerformanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Henüz personel performans verisi bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aylık Performans</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="ciro" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Ciro (₺)" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="musteri" 
                        stroke="#82ca9d" 
                        name="Müşteri Sayısı" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
        )}
      </div>
    </StaffLayout>
  );
}
