
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface ServicePerformanceChartProps {
  data: any[];
  isLoading: boolean;
}

export function ServicePerformanceChart({ data, isLoading }: ServicePerformanceChartProps) {
  const colors = ["#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#ef4444", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">
            İşlem Sayısı: {payload[0].payload.count}
          </p>
          <p className="text-sm font-semibold">
            Toplam Ciro: {formatCurrency(payload[0].payload.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hizmet Performansı</CardTitle>
        <CardDescription>En çok gelir getiren hizmetler</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Henüz veri bulunmamaktadır</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ left: 120 }} // Add more margin for the service names
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Gelir">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
