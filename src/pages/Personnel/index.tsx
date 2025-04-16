import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PersonelIslemi as PersonelIslemiType, islemServisi, personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PersonnelList } from "./components/PersonnelList";
import { PerformanceCharts } from "./components/PerformanceCharts";
import { PersonnelPerformanceReports } from "./components/PersonnelPerformanceReports";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileBarChart, RefreshCcw, Search } from "lucide-react";
import { Navigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PersonnelAnalyst } from "@/components/analyst/PersonnelAnalyst";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";

interface PersonelIslemi extends PersonelIslemiType {
  personel_id: number;
  created_at: string;
}

export default function Personnel() {
  const { userRole, refreshProfile } = useCustomerAuth();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });

  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    refreshProfile().catch(console.error);
  }, []);

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
    retry: 1,
    enabled: userRole === 'admin'
  });

  const { data: personeller = [], refetch: refetchPersonnel, isLoading: personnelLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir(),
    retry: 1,
    enabled: userRole === 'admin'
  });

  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);
  
  useEffect(() => {
    if (personeller.length > 0 && !selectedPersonnelId) {
      setSelectedPersonnelId(personeller[0]?.id || null);
    }
  }, [personeller, selectedPersonnelId]);
  
  const activePersonnelId = selectedPersonnelId || (personeller.length > 0 ? personeller[0]?.id : null);

  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
  };

  const handleMonthCycleChange = (day: number) => {
    setMonthCycleDay(day);
    
    const currentDate = new Date();
    const selectedDay = day;
    
    let fromDate = new Date();
    
    // Set to previous month's cycle day
    fromDate.setDate(selectedDay);
    if (currentDate.getDate() < selectedDay) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    // Create the end date (same day, current month)
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    
    setDateRange({
      from: fromDate,
      to: toDate
    });
    
    setUseMonthCycle(true);
  };

  const { data: rawIslemGecmisi = [], isLoading: islemlerLoading, refetch: refetchOperations } = useQuery({
    queryKey: ['personelIslemleri', dateRange.from, dateRange.to, activePersonnelId],
    queryFn: async () => {
      try {
        const data = selectedPersonnelId 
          ? await personelIslemleriServisi.personelIslemleriGetir(selectedPersonnelId) 
          : await personelIslemleriServisi.hepsiniGetir();
        
        return filterOperationsByDateRange(data);
      } catch (error) {
        console.error("Error fetching operations:", error);
        return [];
      }
    },
    retry: 1,
    enabled: userRole === 'admin' && !!activePersonnelId
  });

  const islemGecmisi: PersonelIslemi[] = rawIslemGecmisi
    .filter(islem => islem.personel_id !== undefined && islem.created_at !== undefined)
    .map(islem => ({
      ...islem,
      personel_id: islem.personel_id as number,
      created_at: islem.created_at as string
    }));

  const filterOperationsByDateRange = (operations: PersonelIslemiType[]) => {
    return operations.filter(islem => {
      if (!islem.created_at) return true;
      const islemDate = new Date(islem.created_at);
      return islemDate >= dateRange.from && islemDate <= dateRange.to;
    });
  };

  const filteredOperations = islemGecmisi.filter(islem => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const personelName = personeller.find(p => p.id === islem.personel_id)?.ad_soyad?.toLowerCase() || '';
    const customerName = islem.musteri 
      ? `${islem.musteri.first_name} ${islem.musteri.last_name || ''}`.toLowerCase() 
      : '';
    const operationName = (islem.islem?.islem_adi || islem.aciklama || '').toLowerCase();
    
    return personelName.includes(searchLower) || 
           customerName.includes(searchLower) || 
           operationName.includes(searchLower);
  });

  if (userRole === 'staff') {
    return <Navigate to="/shop-home" replace />;
  } else if (userRole === 'customer') {
    return <Navigate to="/customer-dashboard" replace />;
  } 
  
  if (!userRole) {
    return (
      <StaffLayout>
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      </StaffLayout>
    );
  }

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

  const totalRevenue = filteredOperations.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
  const totalCommission = filteredOperations.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
  const operationCount = filteredOperations.length;

  return (
    <StaffLayout>
      <div className="container mx-auto">
        <PersonnelAnalyst />
        
        <Tabs defaultValue="personel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personel">Personel Yönetimi</TabsTrigger>
            <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="performans">Performans Raporları</TabsTrigger>
            <TabsTrigger value="raporlar">Grafik Raporları</TabsTrigger>
          </TabsList>

          <TabsContent value="personel">
            <PersonnelList personnel={personeller} onPersonnelSelect={setSelectedPersonnelId} />
          </TabsContent>

          <TabsContent value="islemler">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                  <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Personel, müşteri veya işlem ara..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      {!useMonthCycle && (
                        <DateRangePicker 
                          from={dateRange.from}
                          to={dateRange.to}
                          onSelect={handleDateRangeChange}
                        />
                      )}
                      
                      <CustomMonthCycleSelector 
                        selectedDay={monthCycleDay}
                        onChange={handleMonthCycleChange}
                        active={useMonthCycle}
                        onClear={() => setUseMonthCycle(false)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      className="flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100"
                      onClick={() => refetchOperations()}
                    >
                      <RefreshCcw size={16} />
                      <span>Yenile</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-4">
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
              </CardHeader>
              <CardContent>
                {islemlerLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOperations.length > 0 ? (
                          filteredOperations.map((islem) => (
                            <tr key={islem.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad || 
                                 (islem.personel?.ad_soyad) || 'Belirtilmemiş'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.musteri 
                                  ? `${islem.musteri.first_name} ${islem.musteri.last_name || ''}` 
                                  : 'Belirtilmemiş'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.islem?.islem_adi || islem.aciklama || 'Belirtilmemiş'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.prim_yuzdesi > 0 ? `%${islem.prim_yuzdesi}` : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(islem.tutar || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {islem.prim_yuzdesi > 0 ? formatCurrency(islem.odenen || 0) : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                              {searchTerm ? "Arama kriterleriyle eşleşen işlem bulunamadı" : "Seçilen tarih aralığında işlem bulunamadı"}
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
            <div className="mt-4">
              <PersonnelPerformanceReports personnelId={selectedPersonnelId} />
            </div>
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
