import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface PersonnelPerformanceProps {
  personnelId: number;
}

export function PersonnelPerformance({ personnelId }: PersonnelPerformanceProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnel-operations', personnelId],
    queryFn: async () => {
      return personelIslemleriServisi.personelIslemleriGetir(personnelId);
    },
    enabled: !!personnelId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Bu personel için performans verisi bulunamadı.
      </div>
    );
  }

  // Calculate total revenue and operation count
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const operationCount = operations.length;
  const avgOperationValue = operationCount > 0 ? totalRevenue / operationCount : 0;
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);

  // Calculate monthly distribution
  const monthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      return {
        name: new Date(0, i).toLocaleDateString('tr-TR', { month: 'short' }),
        gelir: 0,
        islemSayisi: 0
      };
    });

    operations.forEach(op => {
      if (!op.created_at) return;
      const date = new Date(op.created_at);
      const monthIndex = date.getMonth();

      months[monthIndex].gelir += op.tutar || 0;
      months[monthIndex].islemSayisi += 1;
    });

    // Only keep months with data
    return months.filter(month => month.gelir > 0 || month.islemSayisi > 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Toplam Gelir</div>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">İşlem Sayısı</div>
            <div className="text-2xl font-bold">{operationCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Ortalama İşlem Tutarı</div>
            <div className="text-2xl font-bold">{formatCurrency(avgOperationValue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Toplam Puan</div>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Aylık Performans Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData()}>
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => {
                if (name === 'gelir') return formatCurrency(value as number);
                return value;
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="gelir" name="Gelir (₺)" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="islemSayisi" name="İşlem Sayısı" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
