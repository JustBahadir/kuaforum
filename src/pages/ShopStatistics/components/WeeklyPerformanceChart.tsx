
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface WeeklyPerformanceChartProps {
  data: ChartDataItem[];
  isLoading: boolean;
}

export function WeeklyPerformanceChart({ data, isLoading }: WeeklyPerformanceChartProps) {
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    if (name === 'ciro') {
      return [formatCurrency(value), 'Ciro'];
    }
    return [value, 'İşlem Sayısı'];
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Haftalık Performans</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Haftalık Performans</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="ciro" 
              name="Ciro (₺)" 
              fill="#8884d8" 
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="islemSayisi"
              name="İşlem Sayısı"
              stroke="#82ca9d"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
