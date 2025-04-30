
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { StaffLayout } from '@/components/ui/staff-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRangeControls } from './components/DateRangeControls';
import { DailyView } from './components/DailyView';
import { WeeklyView } from './components/WeeklyView';
import { MonthlyView } from './components/MonthlyView';
import { YearlyView } from './components/YearlyView';
import { MetricsCards } from './components/MetricsCards';
import { ServicePerformanceChart } from './components/ServicePerformanceChart';
import { HourlyPerformanceChart } from './components/HourlyPerformanceChart';
import { MonthlyPerformanceChart } from './components/MonthlyPerformanceChart';
import { CustomerFrequencyChart } from './components/CustomerFrequencyChart';
import { useQuery } from '@tanstack/react-query';
import { useShopData } from '@/hooks/useShopData';
import { generateSampleStatisticsData } from './components/StatisticsData';
import { CategoryDistributionChart } from './components/CategoryDistributionChart';
import { OperationDistributionChart } from './components/OperationDistributionChart';
import { CustomerLoyaltyChart } from './components/CustomerLoyaltyChart';

export default function ShopStatistics() {
  // Define time period views
  const views = ['daily', 'weekly', 'monthly', 'yearly'] as const;
  type ViewType = typeof views[number];
  
  // State hooks
  const [currentView, setCurrentView] = useState<ViewType>('monthly');
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  // Shop data
  const { isletmeData } = useShopData();
  const shopId = isletmeData?.id;
  
  // Format period display
  const formatPeriod = () => {
    if (currentView === 'daily') {
      return format(dateRange.from, 'd MMMM yyyy', { locale: tr });
    }
    if (currentView === 'weekly') {
      return `${format(dateRange.from, 'd MMMM', { locale: tr })} - ${format(dateRange.to, 'd MMMM yyyy', { locale: tr })}`;
    }
    if (currentView === 'monthly') {
      return format(dateRange.from, 'MMMM yyyy', { locale: tr });
    }
    return format(dateRange.from, 'yyyy', { locale: tr });
  };
  
  // Handle period navigation
  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (currentView === 'daily') {
      const newDate = direction === 'prev' 
        ? new Date(dateRange.from.getTime() - 86400000) // subtract 1 day
        : new Date(dateRange.from.getTime() + 86400000); // add 1 day
      setDateRange({ from: newDate, to: newDate });
    }
    else if (currentView === 'weekly') {
      const newFrom = direction === 'prev'
        ? new Date(dateRange.from.getTime() - 7 * 86400000) // subtract 7 days
        : new Date(dateRange.from.getTime() + 7 * 86400000); // add 7 days
      const newTo = direction === 'prev'
        ? new Date(dateRange.to.getTime() - 7 * 86400000) 
        : new Date(dateRange.to.getTime() + 7 * 86400000);
      setDateRange({ from: newFrom, to: newTo });
    }
    else if (currentView === 'monthly') {
      const newDate = direction === 'prev' 
        ? subMonths(dateRange.from, 1) 
        : addMonths(dateRange.from, 1);
      setDateRange({
        from: startOfMonth(newDate),
        to: endOfMonth(newDate)
      });
    }
    else {
      // Yearly view
      const year = dateRange.from.getFullYear();
      const newYear = direction === 'prev' ? year - 1 : year + 1;
      const newFrom = new Date(newYear, 0, 1); // January 1st
      const newTo = new Date(newYear, 11, 31); // December 31st
      setDateRange({ from: newFrom, to: newTo });
    }
  };
  
  // Handle view change
  const handleViewChange = (view: string) => {
    const newView = view as ViewType;
    setCurrentView(newView);
    
    // Reset date range based on the selected view
    const now = new Date();
    if (newView === 'daily') {
      setDateRange({ from: now, to: now });
    }
    else if (newView === 'weekly') {
      // Start from Monday of current week
      const day = now.getDay() || 7; // Convert Sunday (0) to 7
      const diff = now.getDate() - day + 1; // Monday is 1
      const monday = new Date(now);
      monday.setDate(diff);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      setDateRange({ from: monday, to: sunday });
    }
    else if (newView === 'monthly') {
      setDateRange({
        from: startOfMonth(now),
        to: endOfMonth(now)
      });
    }
    else {
      // Yearly view
      const year = now.getFullYear();
      setDateRange({
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31)
      });
    }
  };

  // Fetch statistics data
  const { data: statisticsData = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['shop-statistics', shopId, dateRange.from, dateRange.to],
    queryFn: async () => {
      // In a real application, we would fetch data from the backend
      // For now, use dummy data
      return generateSampleStatisticsData(dateRange.from, dateRange.to);
    },
    enabled: !!shopId,
    staleTime: 300000 // 5 minutes
  });

  // Get appropriate metrics based on current view
  const getMetricsForView = () => {
    if (!statisticsData || !statisticsData.metrics) return {};
    
    const selectedPeriod = currentView === 'daily' ? 'daily' : 
                          currentView === 'weekly' ? 'weekly' :
                          currentView === 'monthly' ? 'monthly' : 'yearly';
                          
    const metrics = statisticsData.metrics || {};
    return metrics[selectedPeriod] || {};
  };
  
  const metrics = statisticsData.metrics && typeof statisticsData.metrics === 'object' ? statisticsData.metrics : {};
  const currentMetrics = getMetricsForView();
  
  // Get charts data based on available data
  const hourlyData = statisticsData.hourlyData || [];
  const serviceData = statisticsData.serviceData || [];
  const monthlyTrends = statisticsData.monthlyTrends || [];
  const customerFrequency = statisticsData.customerFrequency || [];
  const categoryDistribution = statisticsData.categoryDistribution || [];
  const operationsDistribution = statisticsData.operationsDistribution || [];
  const customerLoyalty = statisticsData.customerLoyalty || [];
  
  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">İşletme İstatistikleri</h1>
        
        {/* View Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <Tabs value={currentView} onValueChange={handleViewChange} className="mb-4 sm:mb-0">
            <TabsList>
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
              <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[150px] text-center">{formatPeriod()}</span>
            <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Date Range Controls for Advanced Filtering */}
        <DateRangeControls 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          currentView={currentView}
        />
        
        {/* Metrics Cards */}
        <div className="mb-6">
          <MetricsCards 
            metrics={currentMetrics as any}
            isLoading={isLoadingStats} 
          />
        </div>
        
        {/* View-specific Content */}
        <div className="mb-6">
          <TabsContent value="daily" className="m-0" forceMount={currentView === 'daily'}>
            {currentView === 'daily' && <DailyView dateRange={dateRange} />}
          </TabsContent>
          
          <TabsContent value="weekly" className="m-0" forceMount={currentView === 'weekly'}>
            {currentView === 'weekly' && <WeeklyView dateRange={dateRange} />}
          </TabsContent>
          
          <TabsContent value="monthly" className="m-0" forceMount={currentView === 'monthly'}>
            {currentView === 'monthly' && <MonthlyView dateRange={dateRange} />}
          </TabsContent>
          
          <TabsContent value="yearly" className="m-0" forceMount={currentView === 'yearly'}>
            {currentView === 'yearly' && <YearlyView dateRange={dateRange} />}
          </TabsContent>
        </div>
        
        {/* Analysis Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ServicePerformanceChart 
            data={serviceData} 
            isLoading={isLoadingStats} 
          />
          <HourlyPerformanceChart 
            data={hourlyData}
            isLoading={isLoadingStats}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MonthlyPerformanceChart 
            data={monthlyTrends}
            isLoading={isLoadingStats}
          />
          <CustomerFrequencyChart 
            data={customerFrequency}
            isLoading={isLoadingStats}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CategoryDistributionChart 
            data={categoryDistribution}
            isLoading={isLoadingStats}
          />
          <OperationDistributionChart 
            data={operationsDistribution}
            isLoading={isLoadingStats}
          />
        </div>
        
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Sadakati</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <CustomerLoyaltyChart 
                data={customerLoyalty}
                isLoading={isLoadingStats}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
