
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface HourlyPerformanceChartProps {
  data: ChartDataItem[];
  isLoading: boolean;
}

export function HourlyPerformanceChart({ data, isLoading }: HourlyPerformanceChartProps) {
  
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
          <CardTitle className="text-lg">Saatlik Performans</CardTitle>
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
        <CardTitle className="text-lg">Saatlik Performans (Bugün)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="ciro" 
              name="Ciro (₺)" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="islemSayisi" 
              name="İşlem Sayısı" 
              stroke="#82ca9d" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
