import React, { useState, useEffect } from 'react';
import { StaffLayout } from "@/components/ui/staff-layout";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  CategoryDistributionChart, 
} from './components/CategoryDistributionChart';
import { 
  HourlyPerformanceChart, 
} from './components/HourlyPerformanceChart';
import { 
  MonthlyPerformanceChart, 
} from './components/MonthlyPerformanceChart';
import { 
  RevenueSourceChart, 
} from './components/RevenueSourceChart';
import { 
  WeeklyPerformanceChart, 
} from './components/WeeklyPerformanceChart';
import { 
  lastWeekData, 
  lastMonthData, 
  servicePerformanceData, 
  dailyData 
} from './components/StatisticsData';
// Import AlertCircle directly from lucide-react instead of the Alert component
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ShopStatistics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [dateRange]);

  return (
    <StaffLayout>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dükkan İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span>Tarih aralığı seçin:</span>
              <DateRangePicker 
                from={dateRange.from}
                to={dateRange.to}
                onSelect={({from, to}) => setDateRange({from, to})}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <WeeklyPerformanceChart data={lastWeekData} isLoading={isLoading} />
          <MonthlyPerformanceChart data={lastMonthData} isLoading={isLoading} />
          <HourlyPerformanceChart data={dailyData} isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <RevenueSourceChart data={servicePerformanceData} isLoading={isLoading} />
          <CategoryDistributionChart
            data={[
              { name: 'Saç Kesimi', value: 4000, count: 45 },
              { name: 'Saç Boyama', value: 6000, count: 30 },
              { name: 'Manikür', value: 2500, count: 25 },
              { name: 'Cilt Bakımı', value: 3000, count: 20 },
            ]}
            isLoading={isLoading}
          />
        </div>
      </div>
    </StaffLayout>
  );
}
