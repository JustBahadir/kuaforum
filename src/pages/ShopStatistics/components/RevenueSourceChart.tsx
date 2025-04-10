
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";

interface RevenueSourceProps {
  data: any[];
  isLoading: boolean;
}

export function RevenueSourceChart({ data, isLoading }: RevenueSourceProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Get total revenue
      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
      
      // Top 5 services by revenue
      const topServices = [...data]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Calculate "others" category
      const topServicesRevenue = topServices.reduce((sum, item) => sum + item.revenue, 0);
      const othersRevenue = totalRevenue - topServicesRevenue;
      
      // Prepare chart data
      const result = [
        ...topServices.map(item => ({
          name: item.name,
          value: item.revenue
        }))
      ];
      
      // Add "others" category if it's significant
      if (othersRevenue > 0) {
        result.push({
          name: 'Diğer Hizmetler',
          value: othersRevenue
        });
      }
      
      setChartData(result);
    } catch (error) {
      console.error("Error preparing revenue source data:", error);
    }
  }, [data]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ciro Kaynak Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = Math.round((data.value / total) * 100);
      
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p className="font-semibold">{`${data.name}`}</p>
          <p>{`Gelir: ${formatCurrency(data.value)}`}</p>
          <p>{`Oran: %${percentage}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ciro Kaynak Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
