
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface OperationDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface OperationDistributionChartProps {
  data: OperationDataItem[];
  isLoading?: boolean;
}

export function OperationDistributionChart({ data, isLoading = false }: OperationDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>İşlem Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Filter and sort data for display
  const chartData = data
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 operations

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşlem Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ScrollArea className="w-full h-full">
          <div className="min-w-[600px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11 }}
                  width={150}
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
                <Bar dataKey="count" name="İşlem Sayısı" fill="#8884d8" barSize={20} />
                <Bar dataKey="revenue" name="Ciro (₺)" fill="#82ca9d" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
