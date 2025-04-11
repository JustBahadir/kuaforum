
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface CategoryDistributionChartProps {
  data: CategoryDataItem[];
  isLoading?: boolean;
}

export function CategoryDistributionChart({ data, isLoading = false }: CategoryDistributionChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kategori Dağılımı</CardTitle>
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
    .slice(0, 7); // Top 7 categories

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Pie
              data={chartData}
              dataKey="count"
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
              formatter={(value: any, name: string, props) => {
                if (name === "count") return [value, "İşlem Sayısı"];
                return [formatCurrency(value as number)];
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend formatter={(value) => value} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
