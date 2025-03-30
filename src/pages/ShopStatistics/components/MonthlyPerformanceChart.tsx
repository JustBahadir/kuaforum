
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface MonthlyPerformanceChartProps {
  data: any[];
  isLoading: boolean;
}

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function MonthlyPerformanceChart({ data, isLoading }: MonthlyPerformanceChartProps) {
  const formatYAxisTick = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };
  
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-500">
            Ciro: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-green-500">
            İşlem Sayısı: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylık Performans</CardTitle>
        <CardDescription>Son 6 aya ait ciro ve işlem sayıları</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Henüz veri bulunmamaktadır</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" tickFormatter={formatYAxisTick} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ciro" 
                name="Ciro (₺)" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="islemSayisi" 
                name="İşlem Sayısı" 
                stroke="#22c55e" 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
