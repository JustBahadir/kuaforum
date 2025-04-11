
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface HourlyPerformanceChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
}

export function HourlyPerformanceChart({ data, isLoading = false }: HourlyPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saatlik Performans</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Günün Saatlik Performansı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tickFormatter={(value) => `₺${value}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'ciro') return [formatCurrency(value as number), 'Ciro'];
                if (name === 'islemSayisi') return [value, 'İşlem Sayısı'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="ciro"
              name="Ciro (₺)"
              fill="#8884d8" 
              barSize={20}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="islemSayisi"
              name="İşlem Sayısı"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
