
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerFrequencyChartProps {
  data: any[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function CustomerFrequencyChart({ data, isLoading }: CustomerFrequencyChartProps) {
  const [frequencyData, setFrequencyData] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Group operations by customer
      const customerOperations = data.reduce((acc, op) => {
        if (!op.musteri_id) return acc;
        
        if (!acc[op.musteri_id]) {
          acc[op.musteri_id] = {
            customerId: op.musteri_id,
            customerName: op.musteri?.first_name 
              ? `${op.musteri.first_name} ${op.musteri.last_name || ''}`
              : `Müşteri #${op.musteri_id}`,
            visits: 0,
            revenue: 0,
            dates: new Set()
          };
        }
        
        acc[op.musteri_id].visits++;
        acc[op.musteri_id].revenue += (op.tutar || 0);
        
        // Add date to track unique visit days
        if (op.created_at) {
          const date = new Date(op.created_at).toISOString().split('T')[0];
          acc[op.musteri_id].dates.add(date);
        }
        
        return acc;
      }, {});
      
      // Categorize by frequency (monthly, quarterly, etc.)
      const frequencyCounts = {
        monthly: 0,    // At least once a month
        quarterly: 0,  // Every 1-3 months
        biannual: 0,   // Every 3-6 months
        yearly: 0,     // Once a year or less
        onetime: 0     // Only visited once
      };
      
      // Analyze visit frequency based on unique visit dates
      Object.values(customerOperations).forEach((customer: any) => {
        const uniqueVisitDays = customer.dates.size;
        
        if (uniqueVisitDays === 1) {
          frequencyCounts.onetime++;
        } else if (uniqueVisitDays >= 12) {
          frequencyCounts.monthly++;
        } else if (uniqueVisitDays >= 4) {
          frequencyCounts.quarterly++;
        } else if (uniqueVisitDays >= 2) {
          frequencyCounts.biannual++;
        } else {
          frequencyCounts.yearly++;
        }
      });
      
      // Format for chart
      const result = [
        { name: 'Aylık Düzenli', value: frequencyCounts.monthly, color: '#0088FE' },
        { name: '3 Ayda Bir', value: frequencyCounts.quarterly, color: '#00C49F' },
        { name: '6 Ayda Bir', value: frequencyCounts.biannual, color: '#FFBB28' },
        { name: 'Yılda Bir', value: frequencyCounts.yearly, color: '#FF8042' },
        { name: 'Tek Seferlik', value: frequencyCounts.onetime, color: '#8884d8' }
      ];
      
      setFrequencyData(result);
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
  
  const renderLabel = ({ name, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Müşteri Ziyaret Sıklığı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {frequencyData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Bu zaman diliminde müşteri verisi bulunmuyor
          </div>
        ) : isMobile ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={frequencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderLabel}
              >
                {frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={frequencyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Müşteri Sayısı" fill="#8884d8">
                {frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
