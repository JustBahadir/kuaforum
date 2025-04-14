
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface ServiceDistributionChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
  title?: string;
}

export function ServiceDistributionChart({ 
  data, 
  isLoading = false, 
  title = "Hizmet Performansı" 
}: ServiceDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
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
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full">
          <div className="min-w-[800px] h-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  height={40}
                  interval={0}
                  tickLine={false}
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
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
