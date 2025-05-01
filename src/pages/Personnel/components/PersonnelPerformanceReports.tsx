
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartBar, ChartLine, ChartPie } from '@/components/ui/chart';
import { format, subDays, subMonths, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { islemServisi } from '@/lib/supabase/services/islemServisi';
import { formatCurrency } from '@/utils/currencyFormatter';

interface PersonnelPerformanceReportsProps {
  personnelId: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface PieChartData {
  id: string;
  value: number;
  label: string;
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      return await islemServisi.personelIslemleriniGetir(personnelId);
    },
    enabled: !!personnelId
  });
  
  // Filter operations based on date range
  const filteredOperations = useMemo(() => {
    const now = new Date();
    
    let startDate;
    switch(dateRange) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }
    
    return operations.filter(op => {
      const opDate = new Date(op.created_at);
      return isWithinInterval(opDate, { start: startDate, end: now });
    });
  }, [operations, dateRange]);
  
  // Prepare data for daily revenue chart
  const dailyRevenueData = useMemo(() => {
    const revenueByDay = new Map<string, number>();
    
    filteredOperations.forEach(op => {
      const dateStr = format(new Date(op.created_at), 'yyyy-MM-dd');
      const currentTotal = revenueByDay.get(dateStr) || 0;
      revenueByDay.set(dateStr, currentTotal + (op.tutar || 0));
    });
    
    const sortedDates = Array.from(revenueByDay.keys()).sort();
    
    return sortedDates.map(date => ({
      name: format(new Date(date), 'd MMM', { locale: tr }),
      value: revenueByDay.get(date) || 0
    }));
  }, [filteredOperations]);
  
  // Prepare data for service distribution chart
  const serviceDistributionData = useMemo(() => {
    const serviceCount = new Map<string, number>();
    
    filteredOperations.forEach(op => {
      const serviceName = op.aciklama || 'Bilinmeyen Hizmet';
      const currentCount = serviceCount.get(serviceName) || 0;
      serviceCount.set(serviceName, currentCount + 1);
    });
    
    return Array.from(serviceCount.entries())
      .map(([name, value]) => ({
        id: name,
        value,
        label: name
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  }, [filteredOperations]);
  
  // Calculate summary metrics
  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalOperations = filteredOperations.length;
  const averageRevenuePerDay = dailyRevenueData.length > 0 
    ? totalRevenue / dailyRevenueData.length 
    : 0;

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Performans verileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={dateRange} onValueChange={(value) => setDateRange(value as 'week' | 'month' | 'year')}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Performans Raporu</h3>
          <TabsList>
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="month">Aylık</TabsTrigger>
            <TabsTrigger value="year">Yıllık</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">İşlem Sayısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOperations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Günlük Ortalama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageRevenuePerDay)}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Günlük Ciro</CardTitle>
              <CardDescription>
                Son {dateRange === 'week' ? '7 gün' : dateRange === 'month' ? '30 gün' : '12 ay'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {dailyRevenueData.length > 0 ? (
                  <ChartBar 
                    data={dailyRevenueData}
                    xField="name"
                    yField="value"
                    formatY={(value) => `₺${value}`}
                    colors={['#6366f1']}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Bu dönem için veri bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Dağılımı</CardTitle>
              <CardDescription>En çok yapılan işlemler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {serviceDistributionData.length > 0 ? (
                  <ChartPie
                    data={serviceDistributionData}
                    valueField="value"
                    categoryField="id"
                    formatValue={(value) => `${value} işlem`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Bu dönem için veri bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
