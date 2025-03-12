
import { useState, useEffect } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { PersonelIslemi, islemServisi, personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PersonnelList } from "./Personnel/components/PersonnelList";
import { PerformanceCharts } from "./Personnel/components/PerformanceCharts";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

export default function Personnel() {
  const { userRole, refreshProfile, userId } = useCustomerAuth();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });
  const [staffId, setStaffId] = useState<number | null>(null);

  // Force refresh user role when component mounts to ensure we have the latest role
  useEffect(() => {
    refreshProfile().catch(console.error);
    
    // If user is staff, get their personel_id
    const getStaffId = async () => {
      if (userRole === 'staff' && userId) {
        try {
          const { data } = await supabase
            .from('personel')
            .select('id')
            .eq('auth_id', userId)
            .single();
            
          if (data?.id) {
            setStaffId(data.id);
          }
        } catch (error) {
          console.error("Error getting staff ID:", error);
        }
      }
    };
    
    getStaffId();
  }, [userRole, userId]);

  // Admin sees all operations, staff sees only their own
  const { data: islemGecmisi = [] }: UseQueryResult<PersonelIslemi[], Error> = useQuery({
    queryKey: ['personelIslemleri', dateRange.from, dateRange.to, staffId, userRole],
    queryFn: async () => {
      // Staff can only see their own operations
      if (userRole === 'staff' && staffId) {
        const data = await personelIslemleriServisi.personelIslemleriGetir(staffId);
        // Filter by date range
        return data.filter(islem => {
          if (!islem.created_at) return true;
          const islemDate = new Date(islem.created_at);
          return islemDate >= dateRange.from && islemDate <= dateRange.to;
        });
      } 
      // Admin sees all operations
      else if (userRole === 'admin') {
        const data = await personelIslemleriServisi.hepsiniGetir();
        // Filter by date range
        return data.filter(islem => {
          if (!islem.created_at) return true;
          const islemDate = new Date(islem.created_at);
          return islemDate >= dateRange.from && islemDate <= dateRange.to;
        });
      }
      
      return [];
    },
    retry: 1,
    enabled: userRole === 'admin' || (userRole === 'staff' && staffId !== null)
  });

  // Admin gets all personnel, staff only needs their own info
  const { data: personeller = [] } = useQuery({
    queryKey: ['personel', userRole, staffId],
    queryFn: async () => {
      if (userRole === 'admin') {
        return personelServisi.hepsiniGetir();
      } else if (userRole === 'staff' && staffId) {
        const data = await personelServisi.getirById(staffId);
        return data ? [data] : [];
      }
      return [];
    },
    retry: 1,
    enabled: userRole === 'admin' || (userRole === 'staff' && staffId !== null)
  });

  // Get operations needed for charts
  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
    retry: 1,
    enabled: userRole === 'admin' || userRole === 'staff'
  });

  // If user is not admin or staff, redirect them to a more appropriate page
  if (userRole === 'customer') {
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

  return (
    <StaffLayout>
      <div className="container mx-auto">
        {userRole === 'admin' ? (
          // Admin view - full tabs with personnel management
          <Tabs defaultValue="personel" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personel">Personel Yönetimi</TabsTrigger>
              <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="raporlar">Performans Raporları</TabsTrigger>
            </TabsList>

            <TabsContent value="personel">
              <PersonnelList />
            </TabsContent>

            <TabsContent value="islemler">
              <Card>
                <CardHeader>
                  <CardTitle>İşlem Geçmişi</CardTitle>
                  <div className="flex gap-4 items-center">
                    <span className="text-sm text-muted-foreground">Tarih aralığı seçin:</span>
                    <DateRangePicker 
                      from={dateRange.from}
                      to={dateRange.to}
                      onSelect={({from, to}) => setDateRange({from, to})}
                    />
                  </div>
                </CardHeader>
                <CardContent>
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
                            <tr key={islem.id}>
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
                                {islem.tutar} TL
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                %{islem.prim_yuzdesi}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.odenen} TL
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
        ) : (
          // Staff view - only shows personal performance
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Personel Performansım</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişim</CardTitle>
                <div className="flex gap-4 items-center">
                  <span className="text-sm text-muted-foreground">Tarih aralığı seçin:</span>
                  <DateRangePicker 
                    from={dateRange.from}
                    to={dateRange.to}
                    onSelect={({from, to}) => setDateRange({from, to})}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
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
                          <tr key={islem.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {islem.aciklama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {islem.tutar} TL
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              %{islem.prim_yuzdesi}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {islem.odenen} TL
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {islem.puan}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            Seçilen tarih aralığında işlem bulunamadı
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Show personal performance metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performans Özeti</CardTitle>
              </CardHeader>
              <CardContent>
                {personeller.length > 0 && islemGecmisi.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-700">Toplam İşlem</h3>
                      <p className="text-2xl">{islemGecmisi.length}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-700">Toplam Ciro</h3>
                      <p className="text-2xl">
                        {islemGecmisi.reduce((sum, islem) => {
                          const tutar = typeof islem.tutar === 'string' 
                            ? parseFloat(islem.tutar) 
                            : islem.tutar;
                          return sum + (isNaN(tutar) ? 0 : tutar);
                        }, 0).toFixed(2)} TL
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-700">Toplam Puan</h3>
                      <p className="text-2xl">
                        {islemGecmisi.reduce((sum, islem) => sum + (islem.puan || 0), 0)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Henüz performans verisi bulunmamaktadır</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
