
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface MonthlyPerformanceChartProps {
  data: any[];
  isLoading: boolean;
}

export function MonthlyPerformanceChart({ data, isLoading }: MonthlyPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aylık Performans</CardTitle>
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
        <CardTitle className="text-lg">Aylık Performans</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: any) => {
                if (typeof value === 'number' && value > 10) {
                  return formatCurrency(value);
                }
                return value;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="ciro" 
              stroke="#8884d8" 
              name="Ciro (TL)" 
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="islemSayisi" 
              stroke="#82ca9d" 
              name="İşlem Sayısı"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
