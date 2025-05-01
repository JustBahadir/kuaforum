
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { islemServisi } from '@/lib/supabase/services/islemServisi';
import { personelServisi } from '@/lib/supabase/services/personelServisi';
import { ChartArea } from '@/components/ui/chart-area';

interface PersonnelDetailsAnalystProps {
  personnelId: number;
}

export function PersonnelDetailsAnalyst({ personnelId }: PersonnelDetailsAnalystProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  const { data: operations = [], isLoading: isLoadingOperations } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      return await islemServisi.personelIslemleriniGetir(personnelId);
    },
    enabled: !!personnelId
  });

  const { data: personnelData } = useQuery({
    queryKey: ['personnel', personnelId],
    queryFn: async () => {
      return await personelServisi.getir(personnelId);
    },
    enabled: !!personnelId
  });

  // Calculate stats
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalPaid = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const operationCount = operations.length;
  const averageRevenue = operationCount > 0 ? totalRevenue / operationCount : 0;

  // Group operations by date for the chart
  const chartData = React.useMemo(() => {
    const dateMap = new Map<string, number>();
    
    // Get operations for the selected period
    const now = new Date();
    const filteredOperations = operations.filter(op => {
      const opDate = new Date(op.created_at);
      const diffTime = Math.abs(now.getTime() - opDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return (
        (selectedPeriod === 'day' && diffDays <= 1) ||
        (selectedPeriod === 'week' && diffDays <= 7) ||
        (selectedPeriod === 'month' && diffDays <= 30)
      );
    });
    
    // Group by date
    filteredOperations.forEach(op => {
      const date = new Date(op.created_at).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + (op.tutar || 0));
    });
    
    // Convert to array format for chart
    return Array.from(dateMap.entries()).map(([date, value]) => ({
      date,
      value
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [operations, selectedPeriod]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{operationCount}</div>
            <p className="text-xs text-muted-foreground">Toplam İşlem</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Toplam Ciro</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">Toplam Ödenen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(averageRevenue)}</div>
            <p className="text-xs text-muted-foreground">Ortalama İşlem Tutarı</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Ciro Analizi
            <div className="mt-1">
              <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as 'day' | 'week' | 'month')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Bugün</TabsTrigger>
                  <TabsTrigger value="week">Bu Hafta</TabsTrigger>
                  <TabsTrigger value="month">Bu Ay</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {isLoadingOperations ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ChartArea
                data={chartData}
                xField="date"
                yField="value"
                formatX={(value) => {
                  const [year, month, day] = value.split('-');
                  return `${day}/${month}`;
                }}
                formatY={(value) => `₺${value}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Bu dönem için veri bulunmuyor
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
