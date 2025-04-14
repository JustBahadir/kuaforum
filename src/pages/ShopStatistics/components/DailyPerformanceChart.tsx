
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface DailyPerformanceChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
}

export function DailyPerformanceChart({ data, isLoading = false }: DailyPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Günlük Performans</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Custom tick renderer for x-axis labels
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={12}
          dominantBaseline="central"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son 7 Günün Performansı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={renderCustomAxisTick} 
              height={50}
            />
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
              barSize={30}
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
