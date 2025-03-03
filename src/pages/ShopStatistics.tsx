import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CircleAlert } from "lucide-react";

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("weekly");
  
  const { data: islemler = [], isLoading } = useQuery({
    queryKey: ['personel-islemleri'],
    queryFn: async () => {
      return await personelIslemleriServisi.hepsiniGetir();
    },
    enabled: !!dukkanId
  });

  const lastWeekData = [
    { name: 'Pazartesi', ciro: 1200, musteri: 10 },
    { name: 'Salı', ciro: 1500, musteri: 12 },
    { name: 'Çarşamba', ciro: 2000, musteri: 15 },
    { name: 'Perşembe', ciro: 1800, musteri: 13 },
    { name: 'Cuma', ciro: 2100, musteri: 16 },
    { name: 'Cumartesi', ciro: 2500, musteri: 20 },
    { name: 'Pazar', ciro: 1000, musteri: 8 },
  ];
  
  const lastMonthData = [
    { name: 'Hafta 1', ciro: 8100, musteri: 65 },
    { name: 'Hafta 2', ciro: 9200, musteri: 75 },
    { name: 'Hafta 3', ciro: 7800, musteri: 60 },
    { name: 'Hafta 4', ciro: 9500, musteri: 80 },
  ];
  
  const servicePerformanceData = [
    { name: 'Saç Kesimi', count: 45, revenue: 3600 },
    { name: 'Saç Boyama', count: 30, revenue: 6000 },
    { name: 'Fön', count: 50, revenue: 2500 },
    { name: 'Manikür', count: 25, revenue: 1250 },
    { name: 'Pedikür', count: 20, revenue: 1000 },
  ];

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dükkan İstatistikleri</h1>
        
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
                <div className="text-2xl font-bold">₺12,100</div>
                <p className="text-xs text-muted-foreground">
                  Geçen haftaya göre +20%
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
                <div className="text-2xl font-bold">94</div>
                <p className="text-xs text-muted-foreground">
                  Geçen haftaya göre +12%
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
                <div className="text-2xl font-bold">147</div>
                <p className="text-xs text-muted-foreground">
                  Geçen haftaya göre +8%
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
                <div className="text-2xl font-bold">₺128.72</div>
                <p className="text-xs text-muted-foreground">
                  Geçen haftaya göre +2%
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lastWeekData}>
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hizmet Performansı</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aylık Performans</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lastMonthData}>
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
                    Yıllık istatistik verileri henüz hazır değil. Daha sonra tekrar kontrol edin.
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
