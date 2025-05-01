
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { personelIslemleriServisi } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface PersonnelAnalystProps {
  personnelId?: number | null;
}

export function PersonnelAnalyst({ personnelId }: PersonnelAnalystProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!personnelId) {
        setData([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const operations = await personelIslemleriServisi.personelIslemleriniGetir(personnelId);
        
        // Group by month
        const monthlyData: Record<string, { month: string, total: number, count: number }> = {};
        
        operations.forEach(operation => {
          if (!operation.created_at) return;
          
          const date = new Date(operation.created_at);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthName,
              total: 0,
              count: 0
            };
          }
          
          monthlyData[monthKey].total += operation.tutar || 0;
          monthlyData[monthKey].count += 1;
        });
        
        // Convert to array and sort by month
        const chartData = Object.values(monthlyData).sort((a, b) => {
          return a.month.localeCompare(b.month);
        });
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching personnel operations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [personnelId]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }
  
  if (!personnelId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Lütfen analiz için bir personel seçin.
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Bu personel için henüz işlem kaydı bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Performans Grafiği</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="total" name="Tutar (₺)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="count" name="İşlem Sayısı" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
