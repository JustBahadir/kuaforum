
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerLoyaltyChartProps {
  data: any[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function CustomerLoyaltyChart({ data, isLoading }: CustomerLoyaltyChartProps) {
  const [loyaltyData, setLoyaltyData] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Group data by customer
      const customerVisits = data.reduce((acc, op) => {
        if (!op.musteri_id) return acc;
        
        if (!acc[op.musteri_id]) {
          acc[op.musteri_id] = {
            customerId: op.musteri_id,
            visits: 0,
            firstVisit: new Date().toISOString(),
            lastVisit: new Date(0).toISOString()
          };
        }
        
        // Count this operation
        acc[op.musteri_id].visits++;
        
        // Track first and last visit dates
        if (op.created_at) {
          if (op.created_at < acc[op.musteri_id].firstVisit) {
            acc[op.musteri_id].firstVisit = op.created_at;
          }
          if (op.created_at > acc[op.musteri_id].lastVisit) {
            acc[op.musteri_id].lastVisit = op.created_at;
          }
        }
        
        return acc;
      }, {});
      
      // Categorize customers
      const categories = {
        new: 0,         // First time visitor within the selected period
        returning: 0,   // 2-5 visits
        loyal: 0        // More than 5 visits
      };
      
      Object.values(customerVisits).forEach((customer: any) => {
        if (customer.visits === 1) {
          categories.new++;
        } else if (customer.visits >= 2 && customer.visits <= 5) {
          categories.returning++;
        } else if (customer.visits > 5) {
          categories.loyal++;
        }
      });
      
      // Format for chart
      const result = [
        { name: 'Yeni Müşteri', value: categories.new, color: '#0088FE' },
        { name: 'Tekrar Gelen', value: categories.returning, color: '#00C49F' },
        { name: 'Sadık Müşteri', value: categories.loyal, color: '#FFBB28' }
      ];
      
      setLoyaltyData(result);
    } catch (error) {
      console.error("Error preparing customer loyalty data:", error);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Sadakati</CardTitle>
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
        <CardTitle className="text-lg">Müşteri Sadakati</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {loyaltyData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Bu zaman diliminde müşteri verisi bulunmuyor
          </div>
        ) : isMobile ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={loyaltyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderLabel}
              >
                {loyaltyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={loyaltyData}
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
                {loyaltyData.map((entry, index) => (
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
