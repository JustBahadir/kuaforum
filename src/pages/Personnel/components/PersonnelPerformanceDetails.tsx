
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock, TrendingUp, Wallet } from "lucide-react";

interface PersonnelPerformanceDetailsProps {
  personnelId: number | null | undefined;
}

export function PersonnelPerformanceDetails({ personnelId }: PersonnelPerformanceDetailsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personel-islemleri', personnelId, dateRange.from, dateRange.to],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnelId ?? 0),
    enabled: personnelId !== null && personnelId !== undefined,
  });

  const filteredOperations = operations.filter(op => {
    if (!op.created_at) return false;
    const date = new Date(op.created_at);
    return date >= dateRange.from && date <= dateRange.to;
  });

  // Performance metrics
  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = filteredOperations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const operationCount = filteredOperations.length;

  // Daily aggregation for chart
  const dailyData = filteredOperations.reduce((acc: Record<string, any>, op) => {
    if (!op.created_at) return acc;
    const date = new Date(op.created_at);
    const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, revenue: 0, commission: 0, count: 0 };
    }
    acc[dateStr].revenue += op.tutar || 0;
    acc[dateStr].commission += op.odenen || 0;
    acc[dateStr].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(dailyData).sort((a, b) => {
    const [dayA, monthA] = a.date.split('.');
    const [dayB, monthB] = b.date.split('.');
    const dateA = new Date(2023, parseInt(monthA) - 1, parseInt(dayA));
    const dateB = new Date(2023, parseInt(monthB) - 1, parseInt(dayB));
    return dateA.getTime() - dateB.getTime();
  });

  const barColors = ['#8b5cf6', '#a78bfa'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pt-4 flex flex-col items-center">
            <CalendarClock className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-base">İşlem Sayısı</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-center">
            {operationCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pt-4 flex flex-col items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-base">Toplam Ciro</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-green-600 text-center">
            {formatCurrency(totalRevenue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pt-4 flex flex-col items-center">
            <Wallet className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-base">Kazanç</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-blue-600 text-center">
            {formatCurrency(totalCommission)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ciro ve Kazanç Grafiği</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Son 30 gün içerisindeki performans verileri
          </p>
        </CardHeader>
        <CardContent className="h-72">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Bu dönem için veri bulunmuyor.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "revenue" ? "Ciro" : "Kazanç"
                  ]}
                />
                <Bar dataKey="revenue" name="Ciro" fill={barColors[0]} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={barColors[0]} />
                  ))}
                </Bar>
                <Bar dataKey="commission" name="Kazanç" fill={barColors[1]} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={barColors[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

