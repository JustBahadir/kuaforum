
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Import components
import { MetricsCards } from "./components/MetricsCards";
import { WeeklyPerformanceChart } from "./components/WeeklyPerformanceChart";
import { MonthlyPerformanceChart } from "./components/MonthlyPerformanceChart";
import { ServicePerformanceChart } from "./components/ServicePerformanceChart";
import { YearlyStatisticsPlaceholder } from "./components/YearlyStatisticsPlaceholder";
import { DailyPerformanceChart } from "./components/DailyPerformanceChart";

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("daily"); // Default to daily view
  
  const { data: shopStats, isLoading: isStatsLoading, refetch: refetchStats, isRefetching } = useQuery({
    queryKey: ['shop-statistics'],
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
    enabled: !!dukkanId
  });
  
  const { data: islemler = [], isLoading: isIslemlerLoading, refetch: refetchIslemler } = useQuery({
    queryKey: ['personel-islemleri'],
    queryFn: async () => {
      return await personelIslemleriServisi.hepsiniGetir();
    },
    enabled: !!dukkanId
  });
  
  // Calculate data for charts based on operations
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  
  // Generate chart data based on operations
  useEffect(() => {
    if (!islemler || islemler.length === 0) return;
    
    try {
      // Prepare daily data (last 7 days)
      const dailyStats = prepareDailyData(islemler);
      setDailyData(dailyStats);
      
      // Prepare weekly data (last 4 weeks)
      const weeklyStats = prepareWeeklyData(islemler);
      setWeeklyData(weeklyStats);
      
      // Prepare monthly data (last 6 months)
      const monthlyStats = prepareMonthlyData(islemler);
      setMonthlyData(monthlyStats);
      
      // Prepare service performance data
      const serviceStats = prepareServiceData(islemler);
      setServiceData(serviceStats);
    } catch (error) {
      console.error("Error preparing chart data:", error);
    }
  }, [islemler]);
  
  const prepareDailyData = (operations) => {
    // Group operations by day for the last 7 days
    const days = [];
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
  
  const prepareWeeklyData = (operations) => {
    // Group operations by week for the last 4 weeks
    const weeks = [];
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
  
  const prepareMonthlyData = (operations) => {
    // Group operations by month for the last 6 months
    const months = [];
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
  
  const prepareServiceData = (operations) => {
    // Group operations by service type
    const services = {};
    
    operations.forEach(op => {
      try {
        if (!op.islem) return;
        
        const serviceId = op.islem.id;
        const serviceName = op.islem.islem_adi;
        
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
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 services
  };
  
  const handleRefresh = async () => {
    toast.info("İstatistikler güncelleniyor...");
    
    try {
      // Force recovery of operations from appointments
      await personelIslemleriServisi.recoverOperationsFromAppointments(0);
      await personelIslemleriServisi.updateShopStatistics();
      
      // Refetch data
      await Promise.all([
        refetchStats(),
        refetchIslemler()
      ]);
      
      toast.success("İstatistikler güncellendi");
    } catch (error) {
      console.error("Error refreshing statistics:", error);
      toast.error("İstatistikler güncellenirken bir hata oluştu");
    }
  };
  
  const isLoading = isStatsLoading || isIslemlerLoading;

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
        
        <Tabs defaultValue={period} onValueChange={setPeriod} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
              <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            </TabsList>
          </div>
          
          <MetricsCards 
            isLoading={isLoading}
            totalRevenue={shopStats?.totalRevenue || 0}
            totalServices={shopStats?.totalServices || 0}
            uniqueCustomerCount={shopStats?.uniqueCustomerCount || 0}
            totalCompletedAppointments={shopStats?.totalServices || 0}
          />
          
          <TabsContent value="daily" className="space-y-4">
            <DailyPerformanceChart data={dailyData} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <WeeklyPerformanceChart data={weeklyData} isLoading={isLoading} />
            <ServicePerformanceChart data={serviceData} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <MonthlyPerformanceChart data={monthlyData} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="yearly">
            <YearlyStatisticsPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
