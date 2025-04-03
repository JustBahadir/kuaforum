import { useState, useEffect } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { PersonelIslemi, islemServisi, personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PersonnelList } from "./Personnel/components/PersonnelList";
import { PerformanceCharts } from "./Personnel/components/PerformanceCharts";
import { PersonnelPerformanceReports } from "./Personnel/components/PersonnelPerformanceReports";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileBarChart } from "lucide-react";
import { Navigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

export default function Personnel() {
  const { userRole, refreshProfile } = useCustomerAuth();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);

  // Force refresh user role when component mounts to ensure we have the latest role
  useEffect(() => {
    refreshProfile().catch(console.error);
  }, []);

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
    retry: 1,
    enabled: userRole === 'admin' // Only fetch if admin
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir(),
    retry: 1,
    enabled: userRole === 'admin' // Only fetch if admin
  });

  const { data: islemGecmisi = [], isLoading: islemlerLoading }: UseQueryResult<PersonelIslemi[], Error> = useQuery({
    queryKey: ['personelIslemleri', dateRange.from, dateRange.to],
    queryFn: async () => {
      const data = await personelIslemleriServisi.hepsiniGetir();
      // Filter by date range
      return data.filter(islem => {
        if (!islem.created_at) return true;
        const islemDate = new Date(islem.created_at);
        return islemDate >= dateRange.from && islemDate <= dateRange.to;
      });
    },
    retry: 1,
    enabled: userRole === 'admin' // Only fetch if admin
  });

  // If user is not admin, redirect them to a more appropriate page
  if (userRole === 'staff') {
    return <Navigate to="/shop-home" replace />;
  } else if (userRole === 'customer') {
    return <Navigate to="/customer-dashboard" replace />;
  } 
  
  // If still loading role, show loading state
  if (!userRole) {
    return (
      <StaffLayout>
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      </StaffLayout>
    );
  }

  // Final check if user is not admin after loading
  if (userRole !== 'admin') {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca yöneticiler personel yönetimi yapabilir.
          </AlertDescription>
        </Alert>
      </StaffLayout>
    );
  }

  // Get summary statistics for the operations
  const totalRevenue = islemGecmisi.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
  const totalCommission = islemGecmisi.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
  const operationCount = islemGecmisi.length;
  
  return (
    <StaffLayout>
      <div className="container mx-auto">
        <Tabs defaultValue="personel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personel">Personel Yönetimi</TabsTrigger>
            <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="performans">Performans Raporları</TabsTrigger>
            <TabsTrigger value="raporlar">Grafik Raporları</TabsTrigger>
          </TabsList>

          <TabsContent value="personel">
            <PersonnelList onPersonnelSelect={setSelectedPersonnelId} />
          </TabsContent>

          <TabsContent value="islemler">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-sm text-muted-foreground">Tarih aralığı seçin:</span>
                    <DateRangePicker 
                      from={dateRange.from}
                      to={dateRange.to}
                      onSelect={({from, to}) => setDateRange({from, to})}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="text-sm bg-gray-100 p-2 rounded-md flex items-center gap-1">
                      <FileBarChart className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Toplam İşlem:</span> 
                      <span>{operationCount}</span>
                    </div>
                    <div className="text-sm bg-gray-100 p-2 rounded-md">
                      <span className="font-medium">Toplam Ciro:</span> 
                      <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="text-sm bg-gray-100 p-2 rounded-md">
                      <span className="font-medium">Toplam Ödenen:</span> 
                      <span className="text-blue-600">{formatCurrency(totalCommission)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {islemlerLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {islemGecmisi.length > 0 ? (
                          islemGecmisi.map((islem) => (
                            <tr key={islem.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.aciklama}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(islem.tutar)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                %{islem.prim_yuzdesi}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(islem.odenen)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.puan}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                              Seçilen tarih aralığında işlem bulunamadı
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performans">
            <Card>
              <CardHeader>
                <CardTitle>Personel Performans Çizelgeleri</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonnelPerformanceReports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raporlar">
            <PerformanceCharts 
              personeller={personeller} 
              islemGecmisi={islemGecmisi}
            />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
