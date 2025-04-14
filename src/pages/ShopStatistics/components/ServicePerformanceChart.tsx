
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface ServicePerformanceChartProps {
  data: ServiceDataItem[];
  isLoading?: boolean;
  title?: string;
}

export function ServicePerformanceChart({ 
  data, 
  isLoading = false, 
  title = "Hizmet Performansı" 
}: ServicePerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10); // Limit to top 10 for better display

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ScrollArea className="w-full h-full">
          <div className="min-w-[600px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11 }}
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
                    if (name === 'revenue') return [formatCurrency(value as number), 'Ciro'];
                    if (name === 'count') return [value, 'İşlem Sayısı'];
                    return [value, name];
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  name="Ciro (₺)" 
                  fill="#8884d8" 
                  barSize={40} 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="count" 
                  name="İşlem Sayısı" 
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
