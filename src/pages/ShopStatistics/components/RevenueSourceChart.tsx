
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface RevenueSourceChartProps {
  data: ServiceDataItem[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function RevenueSourceChart({ data, isLoading }: RevenueSourceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Take top 6 services plus "Others" category
      const topServices = data.slice(0, 6);
      const otherServices = data.slice(6);
      
      // Calculate total for "Others"
      const otherRevenue = otherServices.reduce((sum, item) => sum + item.revenue, 0);
      
      // Prepare chart data
      let result = [...topServices.map(item => ({
        name: item.name,
        value: item.revenue
      }))];
      
      // Add "Others" category if there are more services
      if (otherRevenue > 0) {
        result.push({
          name: "Diğer Hizmetler",
          value: otherRevenue
        });
      }
      
      setChartData(result);
    } catch (error) {
      console.error("Error preparing revenue source chart data:", error);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ciro Kaynağı Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Custom render label function
  const renderLabel = ({ name, percent }: any) => {
    return `${name.length > 15 ? name.slice(0, 15) + '...' : name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ciro Kaynağı Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Bu zaman diliminde ciro verisi bulunmuyor
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
