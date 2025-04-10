
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";

interface CustomerFrequencyProps {
  data: any[];
  isLoading: boolean;
}

export function CustomerFrequencyChart({ data, isLoading }: CustomerFrequencyProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Count visits per customer
      const customerVisits: Record<string, number> = {};
      
      data.forEach(op => {
        if (!op.musteri_id) return;
        const customerId = op.musteri_id.toString();
        customerVisits[customerId] = (customerVisits[customerId] || 0) + 1;
      });
      
      // Create frequency distribution
      const frequencyDistribution: Record<string, number> = {
        '1 Ziyaret': 0,
        '2 Ziyaret': 0,
        '3 Ziyaret': 0,
        '4 Ziyaret': 0,
        '5+ Ziyaret': 0
      };
      
      Object.values(customerVisits).forEach(visits => {
        if (visits === 1) frequencyDistribution['1 Ziyaret']++;
        else if (visits === 2) frequencyDistribution['2 Ziyaret']++;
        else if (visits === 3) frequencyDistribution['3 Ziyaret']++;
        else if (visits === 4) frequencyDistribution['4 Ziyaret']++;
        else frequencyDistribution['5+ Ziyaret']++;
      });
      
      // Convert to array for chart
      const result = Object.entries(frequencyDistribution).map(([name, value]) => ({
        name,
        müşteri: value
      }));
      
      setChartData(result);
    } catch (error) {
      console.error("Error preparing customer frequency data:", error);
    }
  }, [data]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Ziyaret Sıklığı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Müşteri Ziyaret Sıklığı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="müşteri" fill="#8884d8" name="Müşteri Sayısı" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
