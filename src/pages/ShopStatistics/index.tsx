import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, randevuServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns";

// Import components
import { MetricsCards } from "./components/MetricsCards";
import { WeeklyPerformanceChart } from "./components/WeeklyPerformanceChart";
import { MonthlyPerformanceChart } from "./components/MonthlyPerformanceChart";
import { ServicePerformanceChart } from "./components/ServicePerformanceChart";
import { YearlyStatisticsPlaceholder } from "./components/YearlyStatisticsPlaceholder";
import { DailyPerformanceChart } from "./components/DailyPerformanceChart";
import { HourlyPerformanceChart } from "./components/HourlyPerformanceChart";
import { CustomerFrequencyChart } from "./components/CustomerFrequencyChart";
import { HourHeatmapChart } from "./components/HourHeatmapChart";
import { CustomerLoyaltyChart } from "./components/CustomerLoyaltyChart";
import { RevenueSourceChart } from "./components/RevenueSourceChart";
import { ShopAnalyst } from "@/components/analyst/ShopAnalyst";

// Define interfaces for chart data
interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
}

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("daily"); // Default to daily view
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date())
  });
  
  // Set preset date ranges based on selected period
  useEffect(() => {
    const now = new Date();
    
    switch(period) {
      case "daily":
        setDateRange({
          from: startOfDay(now),
          to: endOfDay(now)
        });
        break;
      case "weekly":
        setDateRange({
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 })
        });
        break;
      case "monthly":
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now)
        });
        break;
      case "yearly":
        // Set to current year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        setDateRange({
          from: startOfYear,
          to: endOfYear
        });
        break;
    }
  }, [period]);
  
  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    // Custom period when user manually selects dates
    setPeriod("custom");
  };
  
  const { data: shopStats, isLoading: isStatsLoading, refetch: refetchStats, isRefetching } = useQuery({
    queryKey: ['shop-statistics', dateRange],
    queryFn: async () => {
      try {
        // Retrieve and update shop statistics
        const stats = await personelIslemleriServisi.getShopStatistics();
        await personelIslemleriServisi.updateShopStatistics();
        return stats;
      } catch (error) {
        console.error("Error fetching shop statistics:", error);
        toast.error("İstatistikler yüklenirken bir hata oluştu");
        return null;
      }
    },
    enabled: !!dukkanId,
    refetchOnWindowFocus: false,
    staleTime: 60000 // Consider data fresh for 1 minute
  });
  
  const { data: islemler = [], isLoading: isIslemlerLoading, refetch: refetchIslemler } = useQuery({
    queryKey: ['personel-islemleri', dateRange],
    queryFn: async () => {
      // Filter operations by date range
      return await personelIslemleriServisi.hepsiniGetir();
    },
    enabled: !!dukkanId,
    refetchOnWindowFocus: false,
    staleTime: 60000 // Consider data fresh for 1 minute
  });
  
  const { data: randevular = [], isLoading: isRandevularLoading, refetch: refetchRandevular } = useQuery({
    queryKey: ['randevular-analysis', dateRange],
    queryFn: async () => {
      if (dukkanId) {
        return await randevuServisi.dukkanRandevulariniGetir(dukkanId);
      }
      return [];
    },
    enabled: !!dukkanId,
    staleTime: 60000 // 1 minute
  });
  
  // Filter data by date range
  const filteredIslemler = islemler.filter(islem => {
    if (!islem.created_at) return false;
    const date = new Date(islem.created_at);
    return date >= dateRange.from && date <= dateRange.to;
  });
  
  const filteredRandevular = randevular.filter(randevu => {
    if (!randevu.tarih) return false;
    const date = new Date(randevu.tarih);
    return date >= dateRange.from && date <= dateRange.to;
  });
  
  // Calculate data for charts based on filtered operations
  const [hourlyData, setHourlyData] = useState<ChartDataItem[]>([]);
  const [dailyData, setDailyData] = useState<ChartDataItem[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartDataItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartDataItem[]>([]);
  const [serviceData, setServiceData] = useState<ServiceDataItem[]>([]);
  
  // Generate chart data based on operations
  useEffect(() => {
    if (!filteredIslemler || filteredIslemler.length === 0) return;
    
    try {
      // Prepare hourly data (today's operations by hour)
      const hourlyStats = prepareHourlyData(filteredIslemler);
      setHourlyData(hourlyStats);
      
      // Prepare daily data (last 7 days)
      const dailyStats = prepareDailyData(filteredIslemler);
      setDailyData(dailyStats);
      
      // Prepare weekly data (last 4 weeks)
      const weeklyStats = prepareWeeklyData(filteredIslemler);
      setWeeklyData(weeklyStats);
      
      // Prepare monthly data (last 6 months)
      const monthlyStats = prepareMonthlyData(filteredIslemler);
      setMonthlyData(monthlyStats);
      
      // Prepare service performance data
      const serviceStats = prepareServiceData(filteredIslemler);
      setServiceData(serviceStats);
    } catch (error) {
      console.error("Error preparing chart data:", error);
    }
  }, [filteredIslemler]);
  
  const prepareHourlyData = (operations: any[]): ChartDataItem[] => {
    // Group operations by hour for today
    const hours: ChartDataItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    // Initialize hours array with all 24 hours
    for (let i = 0; i < 24; i++) {
      hours.push({
        name: `${i}:00`,
        ciro: 0,
        islemSayisi: 0
      });
    }
    
    // Aggregate data for today only
    operations.forEach(op => {
      try {
        if (!op.created_at) return;
        
        const opDate = new Date(op.created_at);
        const opDay = new Date(opDate);
        opDay.setHours(0, 0, 0, 0);
        
        // Check if operation happened today
        if (opDay.getTime() === today.getTime()) {
          const hourIndex = opDate.getHours();
          
          hours[hourIndex].ciro += (op.tutar || 0);
          hours[hourIndex].islemSayisi += 1;
        }
      } catch (e) {
        console.error("Error processing operation for hourly chart:", e);
      }
    });
    
    return hours;
  };
  
  const prepareDailyData = (operations: any[]): ChartDataItem[] => {
    // Group operations by day for the last 7 days
    const days: ChartDataItem[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      days.push({
        name: dayStr,
        ciro: 0,
        islemSayisi: 0
      });
    }
    
    // Aggregate data
    operations.forEach(op => {
      try {
        if (!op.created_at) return;
        
        const opDate = new Date(op.created_at).toISOString().split('T')[0];
        const dayItem = days.find(d => d.name === opDate);
        
        if (dayItem) {
          dayItem.ciro += (op.tutar || 0);
          dayItem.islemSayisi += 1;
        }
      } catch (e) {
        console.error("Error processing operation for daily chart:", e);
      }
    });
    
    // Format dates for display
    days.forEach(day => {
      const date = new Date(day.name);
      day.name = date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    });
    
    return days;
  };
  
  const prepareWeeklyData = (operations: any[]): ChartDataItem[] => {
    // Group operations by week for the last 4 weeks
    const weeks: (ChartDataItem & {
      startDate: string;
      endDate: string;
    })[] = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (i * 7 + 6));
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - (i * 7));
      
      weeks.push({
        name: `Hafta ${4-i}`,
        ciro: 0,
        islemSayisi: 0,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    }
    
    // Aggregate data
    operations.forEach(op => {
      try {
        if (!op.created_at) return;
        
        const opDate = new Date(op.created_at);
        const weekItem = weeks.find(w => 
          opDate >= new Date(w.startDate) && 
          opDate <= new Date(w.endDate)
        );
        
        if (weekItem) {
          weekItem.ciro += (op.tutar || 0);
          weekItem.islemSayisi += 1;
        }
      } catch (e) {
        console.error("Error processing operation for weekly chart:", e);
      }
    });
    
    // Remove extra properties
    return weeks.map(({ name, ciro, islemSayisi }) => ({ name, ciro, islemSayisi }));
  };
  
  const prepareMonthlyData = (operations: any[]): ChartDataItem[] => {
    // Group operations by month for the last 6 months
    const months: (ChartDataItem & {
      month: number;
      year: number;
    })[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      
      months.push({
        name: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        ciro: 0,
        islemSayisi: 0,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    
    // Aggregate data
    operations.forEach(op => {
      try {
        if (!op.created_at) return;
        
        const opDate = new Date(op.created_at);
        const monthItem = months.find(m => 
          opDate.getMonth() === m.month && 
          opDate.getFullYear() === m.year
        );
        
        if (monthItem) {
          monthItem.ciro += (op.tutar || 0);
          monthItem.islemSayisi += 1;
        }
      } catch (e) {
        console.error("Error processing operation for monthly chart:", e);
      }
    });
    
    // Remove extra properties
    return months.map(({ name, ciro, islemSayisi }) => ({ name, ciro, islemSayisi }));
  };
  
  const prepareServiceData = (operations: any[]): ServiceDataItem[] => {
    // Group operations by service type
    const services: Record<string, ServiceDataItem> = {};
    
    operations.forEach(op => {
      try {
        if (!op.islem && !op.aciklama) return;
        
        // Get service name either from islem.islem_adi or clean up aciklama
        let serviceName = '';
        if (op.islem && op.islem.islem_adi) {
          serviceName = op.islem.islem_adi;
        } else if (op.aciklama) {
          serviceName = op.aciklama.split(' hizmeti verildi')[0];
        }
        
        if (!serviceName) return;
        
        const serviceId = serviceName; // Use name as ID
        
        if (!services[serviceId]) {
          services[serviceId] = {
            name: serviceName,
            count: 0,
            revenue: 0
          };
        }
        
        services[serviceId].count += 1;
        services[serviceId].revenue += (op.tutar || 0);
      } catch (e) {
        console.error("Error processing operation for service chart:", e);
      }
    });
    
    // Convert to array and sort by revenue
    return Object.values(services)
      .sort((a, b) => b.revenue - a.revenue);
  };
  
  const handleRefresh = async () => {
    toast.info("İstatistikler güncelleniyor...");
    
    try {
      // Force recovery of operations from appointments
      await personelIslemleriServisi.recoverOperations({ get_all: true });
      await personelIslemleriServisi.updateShopStatistics();
      
      // Refetch data
      await Promise.all([
        refetchStats(),
        refetchIslemler(),
        refetchRandevular()
      ]);
      
      toast.success("İstatistikler güncellendi");
    } catch (error) {
      console.error("Error refreshing statistics:", error);
      toast.error("İstatistikler güncellenirken bir hata oluştu");
    }
  };
  
  const isLoading = isStatsLoading || isIslemlerLoading || isRandevularLoading;

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dükkan İstatistikleri</h1>
          
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Verileri Güncelle
          </Button>
        </div>

        <div className="mb-6">
          <ShopAnalyst 
            dukkanId={dukkanId} 
            dateRange={dateRange}
            period={period} 
          />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <Tabs defaultValue={period} onValueChange={setPeriod} className="space-y-4 flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
              <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <DateRangePicker 
              from={dateRange.from}
              to={dateRange.to}
              onSelect={handleDateRangeChange}
            />
          </div>
        </div>
        
        <MetricsCards 
          isLoading={isLoading}
          totalRevenue={shopStats?.totalRevenue || 0}
          totalServices={shopStats?.totalServices || 0}
          uniqueCustomerCount={shopStats?.uniqueCustomerCount || 0}
          totalCompletedAppointments={shopStats?.totalCompletedAppointments || 0}
          cancelledAppointments={shopStats?.cancelledAppointments || 0}
          newCustomers={shopStats?.newCustomers || 0}
          loyalCustomers={shopStats?.loyalCustomers || 0}
        />
        
        {/* Common charts for all views */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <ServicePerformanceChart data={serviceData} isLoading={isLoading} />
          <CustomerLoyaltyChart data={filteredIslemler} isLoading={isLoading} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <CustomerFrequencyChart data={filteredIslemler} isLoading={isLoading} />
          <RevenueSourceChart data={serviceData} isLoading={isLoading} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <HourHeatmapChart data={filteredIslemler} isLoading={isLoading} />
          {period === "daily" && (
            <HourlyPerformanceChart data={hourlyData} isLoading={isLoading} />
          )}
          {period === "weekly" && (
            <DailyPerformanceChart data={dailyData} isLoading={isLoading} />
          )}
          {period === "monthly" && (
            <WeeklyPerformanceChart data={weeklyData} isLoading={isLoading} />
          )}
          {period === "yearly" && (
            <MonthlyPerformanceChart data={monthlyData} isLoading={isLoading} />
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
