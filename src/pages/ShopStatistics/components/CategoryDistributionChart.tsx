
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  count: number;
  percentage?: number;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
  isLoading: boolean;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export function CategoryDistributionChart({ data, isLoading }: CategoryDistributionChartProps) {
  // Format number as percentage
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
          <p className="font-bold">{item.name}</p>
          <p className="text-sm">Tutar: {formatCurrency(item.value)}</p>
          <p className="text-sm">İşlem Sayısı: {item.count}</p>
          <p className="text-sm">Oran: {formatPercent(payload[0].percent)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Kategori Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[400px]">
            <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && data.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Kategori</th>
                  <th className="py-2 px-4 text-right">İşlem Sayısı</th>
                  <th className="py-2 px-4 text-right">Ciro</th>
                  <th className="py-2 px-4 text-right">Oran</th>
                </tr>
              </thead>
              <tbody>
                {data.map((category, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-left">
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 mr-2 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {category.name}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right">{category.count}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(category.value)}</td>
                    <td className="py-2 px-4 text-right">
                      {category.percentage ? `${(category.percentage).toFixed(1)}%` : 
                        formatPercent(category.value / data.reduce((sum, item) => sum + item.value, 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
