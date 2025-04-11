
import { useState, useEffect, useMemo } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { personelServisi } from "@/lib/supabase";
import { CircleAlert, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DailyPerformanceChart } from "./ShopStatistics/components/DailyPerformanceChart";
import { WeeklyPerformanceChart } from "./ShopStatistics/components/WeeklyPerformanceChart";
import { MonthlyPerformanceChart } from "./ShopStatistics/components/MonthlyPerformanceChart";
import { HourlyPerformanceChart } from "./ShopStatistics/components/HourlyPerformanceChart";
import { ServiceDistributionChart } from "./ShopStatistics/components/ServiceDistributionChart";
import { CategoryDistributionChart } from "./ShopStatistics/components/CategoryDistributionChart";
import { OperationDistributionChart } from "./ShopStatistics/components/OperationDistributionChart";
import { DateRangeControls } from "./ShopStatistics/components/DateRangeControls";
import { ShopAnalyst } from "@/components/analyst/ShopAnalyst";

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("weekly");
  const [customMonthDay, setCustomMonthDay] = useState<number>(1);
  const [hasData, setHasData] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  // Fetch personnel data
  const { data: personeller = [], isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ['personel-list'],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !!dukkanId
  });

  // Fetch operations data
  const { data: islemler = [], isLoading: isLoadingIslemler, refetch: refetchIslemler } = useQuery({
    queryKey: ['personel-islemleri', dateRange.from, dateRange.to],
    queryFn: async () => {
      return await personelIslemleriServisi.hepsiniGetir();
    },
    enabled: !!dukkanId
  });

  // Fetch appointment data
  const { data: randevular = [], isLoading: isLoadingRandevular, refetch: refetchRandevular } = useQuery({
    queryKey: ['randevular', dateRange.from, dateRange.to],
    queryFn: async () => {
      if (dukkanId) {
        return await randevuServisi.dukkanRandevulariniGetir(dukkanId);
      }
      return [];
    },
    enabled: !!dukkanId
  });

  const isLoading = isLoadingIslemler || isLoadingRandevular || isLoadingPersoneller;

  // Filter operations by date range
  const filteredOperations = useMemo(() => {
    return islemler.filter(op => {
      if (!op.created_at) return false;
      const date = new Date(op.created_at);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [islemler, dateRange]);
  
  // Refresh data
  const handleRefresh = async () => {
    await Promise.all([refetchIslemler(), refetchRandevular()]);
  };

  useEffect(() => {
    if (!isLoading) {
      setHasData(islemler.length > 0 || randevular.length > 0);
    }
  }, [islemler, randevular, isLoading]);

  // Process data for main charts based on period
  const { dailyData, weeklyData, monthlyData, hourlyData } = useMemo(() => {
    // Initialize data structures
    const dailyData: any[] = [];
    const weeklyData: any[] = [];
    const monthlyData: any[] = [];
    const hourlyData: any[] = [];
    
    // Process operations
    if (filteredOperations.length > 0) {
      // Group by day for daily data (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();
      
      last7Days.forEach(day => {
        const dayStr = day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric' });
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));
        
        const dayOperations = filteredOperations.filter(op => {
          const opDate = new Date(op.created_at);
          return opDate >= dayStart && opDate <= dayEnd;
        });
        
        dailyData.push({
          name: dayStr,
          ciro: dayOperations.reduce((sum, op) => sum + (op.tutar || 0), 0),
          islemSayisi: dayOperations.length
        });
      });
      
      // Group by weekday for weekly data
      const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const weekdayMap: Record<number, { ciro: number, islemSayisi: number }> = {};
      
      filteredOperations.forEach(op => {
        if (!op.created_at) return;
        const date = new Date(op.created_at);
        // Get day index (0 = Sunday in JS, we want 0 = Monday)
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        
        if (!weekdayMap[dayIndex]) {
          weekdayMap[dayIndex] = { ciro: 0, islemSayisi: 0 };
        }
        
        weekdayMap[dayIndex].ciro += op.tutar || 0;
        weekdayMap[dayIndex].islemSayisi += 1;
      });
      
      weekDays.forEach((day, index) => {
        weeklyData.push({
          name: day,
          ciro: weekdayMap[index]?.ciro || 0,
          islemSayisi: weekdayMap[index]?.islemSayisi || 0
        });
      });
      
      // Group by month/week for monthly data
      const monthlyGroups = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5+ Hafta'];
      const monthlyMap: Record<number, { ciro: number, islemSayisi: number }> = {};
      
      filteredOperations.forEach(op => {
        if (!op.created_at) return;
        const date = new Date(op.created_at);
        // Calculate week of month (1-indexed)
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        const weekIndex = weekOfMonth > 4 ? 4 : weekOfMonth - 1;
        
        if (!monthlyMap[weekIndex]) {
          monthlyMap[weekIndex] = { ciro: 0, islemSayisi: 0 };
        }
        
        monthlyMap[weekIndex].ciro += op.tutar || 0;
        monthlyMap[weekIndex].islemSayisi += 1;
      });
      
      monthlyGroups.forEach((week, index) => {
        monthlyData.push({
          name: week,
          ciro: monthlyMap[index]?.ciro || 0,
          islemSayisi: monthlyMap[index]?.islemSayisi || 0
        });
      });
      
      // Group by hour for hourly data
      const hours = Array(24).fill(0).map((_, i) => `${i}:00`);
      const hourlyMap: Record<number, { ciro: number, islemSayisi: number }> = {};
      
      filteredOperations.forEach(op => {
        if (!op.created_at) return;
        const date = new Date(op.created_at);
        const hour = date.getHours();
        
        if (!hourlyMap[hour]) {
          hourlyMap[hour] = { ciro: 0, islemSayisi: 0 };
        }
        
        hourlyMap[hour].ciro += op.tutar || 0;
        hourlyMap[hour].islemSayisi += 1;
      });
      
      hours.forEach((hourLabel, index) => {
        hourlyData.push({
          name: hourLabel,
          ciro: hourlyMap[index]?.ciro || 0,
          islemSayisi: hourlyMap[index]?.islemSayisi || 0
        });
      });
    }
    
    return { dailyData, weeklyData, monthlyData, hourlyData };
  }, [filteredOperations]);
  
  // Process service distribution data
  const serviceData = useMemo(() => {
    const serviceMap: Record<string, { ciro: number; islemSayisi: number }> = {};
    
    filteredOperations.forEach(op => {
      const serviceName = op.islem?.islem_adi || 
                         (op.aciklama?.includes(' hizmeti verildi') ? 
                         op.aciklama.split(' hizmeti verildi')[0] : op.aciklama) || 
                         'Bilinmeyen İşlem';
                         
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { ciro: 0, islemSayisi: 0 };
      }
      
      serviceMap[serviceName].ciro += op.tutar || 0;
      serviceMap[serviceName].islemSayisi += 1;
    });
    
    return Object.entries(serviceMap).map(([name, data]) => ({
      name,
      ciro: data.ciro,
      islemSayisi: data.islemSayisi
    })).sort((a, b) => b.ciro - a.ciro);
  }, [filteredOperations]);
  
  // Process category distribution data
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, { value: number; count: number }> = {};
    
    filteredOperations.forEach(op => {
      const categoryName = op.islem?.kategori_adi || 'Diğer';
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { value: 0, count: 0 };
      }
      
      categoryMap[categoryName].value += op.tutar || 0;
      categoryMap[categoryName].count += 1;
    });
    
    // Calculate percentages
    const total = Object.values(categoryMap).reduce((sum, item) => sum + item.value, 0);
    
    return Object.entries(categoryMap).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
      percentage: total > 0 ? data.value / total : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredOperations]);
  
  // Process operation distribution data
  const operationData = useMemo(() => {
    const operationMap: Record<string, { count: number; revenue: number }> = {};
    
    filteredOperations.forEach(op => {
      const serviceName = op.islem?.islem_adi || 
                         (op.aciklama?.includes(' hizmeti verildi') ? 
                         op.aciklama.split(' hizmeti verildi')[0] : op.aciklama) || 
                         'Bilinmeyen İşlem';
                         
      if (!operationMap[serviceName]) {
        operationMap[serviceName] = { count: 0, revenue: 0 };
      }
      
      operationMap[serviceName].count += 1;
      operationMap[serviceName].revenue += op.tutar || 0;
    });
    
    return Object.entries(operationMap).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue
    })).sort((a, b) => b.count - a.count);
  }, [filteredOperations]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
    const customerIds = new Set(filteredOperations.map(op => op.musteri_id).filter(Boolean));
    const customerCount = customerIds.size;
    const operationCount = filteredOperations.length;
    const averageSpending = customerCount > 0 ? totalRevenue / customerCount : 0;
    const completedAppointments = randevular.filter(r => 
      r.durum === 'tamamlandi' && 
      new Date(r.tarih) >= dateRange.from &&
      new Date(r.tarih) <= dateRange.to
    ).length;

    return {
      totalRevenue,
      customerCount,
      operationCount,
      averageSpending,
      completedAppointments
    };
  }, [filteredOperations, randevular, dateRange]);

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4">Dükkan İstatistikleri</h1>
        
        <div className="mb-6">
          <DateRangeControls
            period={period}
            setPeriod={setPeriod}
            dateRange={dateRange}
            setDateRange={setDateRange}
            customMonthDay={customMonthDay}
            setCustomMonthDay={setCustomMonthDay}
            onRefresh={handleRefresh}
          />
        </div>
        
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
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Ciro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Seçili dönem ciro bilgisi
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
                    Seçili dönem müşteri sayısı
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
                    Seçili dönem işlem sayısı
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
                    Seçili dönem tamamlanan randevu
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="col-span-2">
                <ShopAnalyst 
                  dukkanId={dukkanId || undefined}
                  dateRange={dateRange}
                  period={period}
                />
              </div>
            </div>
            
            <Tabs defaultValue={period} onValueChange={setPeriod} className="space-y-6">
              <TabsList>
                <TabsTrigger value="daily">Günlük</TabsTrigger>
                <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                <TabsTrigger value="monthly">Aylık</TabsTrigger>
                <TabsTrigger value="hourly">Saatlik</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <DailyPerformanceChart data={dailyData} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="weekly">
                <WeeklyPerformanceChart data={weeklyData} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="monthly">
                <MonthlyPerformanceChart data={monthlyData} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="hourly">
                <HourlyPerformanceChart data={hourlyData} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
            
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <ServiceDistributionChart data={serviceData} isLoading={isLoading} />
              <CategoryDistributionChart data={categoryData} isLoading={isLoading} />
            </div>
            
            <div className="mt-6">
              <OperationDistributionChart data={operationData} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
