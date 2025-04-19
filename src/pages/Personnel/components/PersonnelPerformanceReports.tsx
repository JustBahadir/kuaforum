
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend
} from "recharts";
import { personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock, TrendingUp, Wallet } from "lucide-react";
import { addDays } from "date-fns";
import { DateControlBar } from "@/components/ui/date-control-bar";

export function PersonnelPerformanceReports({ personnelId = null }: { personnelId?: number | null }) {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personel-islemleri', personnelId, dateRange.from, dateRange.to],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnelId),
  });

  const filteredOperations = operations.filter(op => {
    if (!op.created_at) return false;
    const date = new Date(op.created_at);
    return date >= dateRange.from && date <= dateRange.to;
  });

  // Calculate performance metrics
  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = filteredOperations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const operationCount = filteredOperations.length;
  
  // Calculate daily data for chart
  const dailyData = filteredOperations.reduce((acc: any, op) => {
    if (!op.created_at) return acc;
    
    const date = new Date(op.created_at);
    const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        revenue: 0,
        commission: 0,
        count: 0
      };
    }
    
    acc[dateStr].revenue += op.tutar || 0;
    acc[dateStr].commission += op.odenen || 0;
    acc[dateStr].count += 1;
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  const chartData = Object.values(dailyData).sort((a: any, b: any) => {
    const [dayA, monthA] = a.date.split('.');
    const [dayB, monthB] = b.date.split('.');
    const dateA = new Date(2023, parseInt(monthA) - 1, parseInt(dayA));
    const dateB = new Date(2023, parseInt(monthB) - 1, parseInt(dayB));
    return dateA.getTime() - dateB.getTime();
  });

  const barColors = ['#8b5cf6', '#a78bfa'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <DateControlBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
      
      {/* Removed weekly/monthly tabs and content completely */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <CalendarClock className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="text-lg font-medium">İşlem Sayısı</h4>
              <p className="text-2xl font-semibold">{operationCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="text-lg font-medium">Toplam Ciro</h4>
              <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Wallet className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="text-lg font-medium">Kazanç</h4>
              <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totalCommission)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Ciro ve Kazanç Grafiği</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Son 30 gün içerisindeki performans verileri
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Bu dönem için veri bulunmuyor.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Ciro" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[0]} />
                    ))}
                  </Bar>
                  <Bar dataKey="commission" name="Kazanç" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[1]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

