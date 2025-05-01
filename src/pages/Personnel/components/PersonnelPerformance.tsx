
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { islemServisi } from '@/lib/supabase/services/islemServisi';
import { formatCurrency } from '@/utils/currencyFormatter';

interface PersonnelPerformanceProps {
  personnelId: number;
}

export function PersonnelPerformance({ personnelId }: PersonnelPerformanceProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      return await islemServisi.personelIslemleriniGetir(personnelId);
    },
    enabled: !!personnelId
  });

  // Calculate performance metrics
  const totalOperations = operations.length;
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalPaid = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const averageRevenue = totalOperations > 0 ? totalRevenue / totalOperations : 0;
  
  // Get today's operations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOperations = operations.filter(op => {
    const opDate = new Date(op.created_at);
    return opDate >= today;
  });
  
  const todayRevenue = todayOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  
  // Get this week's operations
  const firstDayOfWeek = new Date(today);
  const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1); // Adjust for Sunday
  firstDayOfWeek.setDate(diff);
  firstDayOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekOperations = operations.filter(op => {
    const opDate = new Date(op.created_at);
    return opDate >= firstDayOfWeek;
  });
  
  const thisWeekRevenue = thisWeekOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  
  // Get this month's operations
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const thisMonthOperations = operations.filter(op => {
    const opDate = new Date(op.created_at);
    return opDate >= firstDayOfMonth;
  });
  
  const thisMonthRevenue = thisMonthOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bugünkü Ciro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {todayOperations.length} işlem
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(thisWeekRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {thisWeekOperations.length} işlem
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {thisMonthOperations.length} işlem
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ortalama İşlem Tutarı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {totalOperations} toplam işlem
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
