
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
