
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface HourlyPerformanceChartProps {
  data: any[];
  isLoading: boolean;
}

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function HourlyPerformanceChart({ data, isLoading }: HourlyPerformanceChartProps) {
  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
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
        <CardTitle>Saatlik Performans</CardTitle>
        <CardDescription>Bugünün saatlik ciro ve işlem sayısı</CardDescription>
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" tickFormatter={formatYAxisTick} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="ciro" name="Ciro (₺)" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="islemSayisi" name="İşlem Sayısı" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
