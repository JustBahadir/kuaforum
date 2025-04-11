
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface RevenueSourceChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
}

export function RevenueSourceChart({ data, isLoading = false }: RevenueSourceChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ciro Kaynakları</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Filter and sort data for display
  const chartData = data
    .filter(item => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7); // Top 7 items

  // Create "Diğer" category for remaining items
  if (data.length > 7) {
    const otherRevenue = data
      .slice(7)
      .reduce((sum, item) => sum + item.revenue, 0);
    
    if (otherRevenue > 0) {
      chartData.push({
        name: 'Diğer',
        count: data.slice(7).reduce((sum, item) => sum + item.count, 0),
        revenue: otherRevenue
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ciro Kaynakları</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => 
                `${name.length > 15 ? name.substring(0, 15) + '...' : name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: '#666', strokeWidth: 1 }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => formatCurrency(value as number)}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
