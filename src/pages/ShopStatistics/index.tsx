
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";

// Import components
import { MetricsCards } from "./components/MetricsCards";
import { WeeklyPerformanceChart } from "./components/WeeklyPerformanceChart";
import { MonthlyPerformanceChart } from "./components/MonthlyPerformanceChart";
import { ServicePerformanceChart } from "./components/ServicePerformanceChart";
import { YearlyStatisticsPlaceholder } from "./components/YearlyStatisticsPlaceholder";
import { DailyPerformanceChart } from "./components/DailyPerformanceChart";

// Import data
import { 
  lastWeekData, 
  lastMonthData, 
  servicePerformanceData, 
  dailyData 
} from "./components/StatisticsData";

export default function ShopStatistics() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [period, setPeriod] = useState<string>("daily"); // Default to daily view
  
  const { data: islemler = [], isLoading } = useQuery({
    queryKey: ['personel-islemleri'],
    queryFn: async () => {
      return await personelIslemleriServisi.hepsiniGetir();
    },
    enabled: !!dukkanId
  });

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dükkan İstatistikleri</h1>
        
        <Tabs defaultValue={period} onValueChange={setPeriod} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
              <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            </TabsList>
          </div>
          
          <MetricsCards />
          
          <TabsContent value="daily" className="space-y-4">
            <DailyPerformanceChart data={dailyData} />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <WeeklyPerformanceChart data={lastWeekData} />
            <ServicePerformanceChart data={servicePerformanceData} />
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <MonthlyPerformanceChart data={lastMonthData} />
          </TabsContent>
          
          <TabsContent value="yearly">
            <YearlyStatisticsPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
