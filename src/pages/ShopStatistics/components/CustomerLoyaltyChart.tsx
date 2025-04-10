
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";

interface CustomerLoyaltyProps {
  data: any[];
  isLoading: boolean;
}

export function CustomerLoyaltyChart({ data, isLoading }: CustomerLoyaltyProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Group customers by visit dates
      const customerFirstVisits: Record<string, Date> = {};
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      
      // Determine first visit for each customer
      data.forEach(op => {
        if (!op.musteri_id || !op.created_at) return;
        const customerId = op.musteri_id.toString();
        const visitDate = new Date(op.created_at);
        
        if (!customerFirstVisits[customerId] || visitDate < customerFirstVisits[customerId]) {
          customerFirstVisits[customerId] = visitDate;
        }
      });
      
      // Count customers in each segment
      let newCustomers = 0;
      let returningCustomers = 0;
      let loyalCustomers = 0;
      
      Object.values(customerFirstVisits).forEach(firstVisit => {
        if (firstVisit > thirtyDaysAgo) {
          newCustomers++;
        } else if (firstVisit > ninetyDaysAgo) {
          returningCustomers++;
        } else {
          loyalCustomers++;
        }
      });
      
      // Prepare chart data
      const result = [
        { name: 'Yeni (0-30 gün)', value: newCustomers },
        { name: 'Düzenli (30-90 gün)', value: returningCustomers },
        { name: 'Sadık (90+ gün)', value: loyalCustomers }
      ];
      
      setChartData(result);
    } catch (error) {
      console.error("Error preparing customer loyalty data:", error);
    }
  }, [data]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Sadakat Analizi</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = Math.round((data.value / total) * 100);
      
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p className="font-semibold">{`${data.name}`}</p>
          <p>{`Müşteri Sayısı: ${data.value}`}</p>
          <p>{`Oran: %${percentage}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Müşteri Sadakat Analizi</CardTitle>
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
