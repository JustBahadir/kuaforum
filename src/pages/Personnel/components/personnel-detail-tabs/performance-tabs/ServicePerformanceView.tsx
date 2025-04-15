
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { personelIslemleriServisi } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from "recharts";

interface ServicePerformanceViewProps {
  personnel: any;
  dateRange?: { from: Date; to: Date };
}

export function ServicePerformanceView({ 
  personnel,
  dateRange 
}: ServicePerformanceViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [serviceData, setServiceData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Here you would fetch actual data with date range
        // For now, using mock data
        const mockData = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
        
        // Process data for services
        const servicesMap = new Map();
        
        // Group by service
        mockData.forEach(op => {
          const serviceId = op.islem_id;
          const serviceName = op.aciklama || "Bilinmeyen İşlem";
          
          if (!servicesMap.has(serviceId)) {
            servicesMap.set(serviceId, {
              service_id: serviceId,
              service_name: serviceName,
              count: 0,
              amount: 0,
            });
          }
          
          const service = servicesMap.get(serviceId);
          service.count += 1;
          service.amount += op.tutar || 0;
        });
        
        // Convert to array and sort by amount
        const servicesData = Array.from(servicesMap.values())
          .sort((a, b) => b.amount - a.amount);
        
        setServiceData(servicesData);
        
        // Prepare data for charts
        const chartData = servicesData.map(item => ({
          name: item.service_name,
          ciro: item.amount,
          islem: item.count,
          value: item.amount // for pie chart
        }));
        
        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [personnel.id, dateRange]);

  // Colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#FFBB28', '#00C49F', '#FF8042'];

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-[300px] w-full rounded-md" />
      <Skeleton className="h-[200px] w-full rounded-md" />
      <Skeleton className="h-[200px] w-full rounded-md" />
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Bar and Line Chart */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Hizmet Performansı</h4>
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="w-full min-w-[600px]">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: any, name: any) => [
                  name === 'ciro' ? formatCurrency(value) : value,
                  name === 'ciro' ? 'Ciro' : 'İşlem Sayısı'
                ]} />
                <Legend />
                <Bar yAxisId="left" dataKey="ciro" fill="#8884d8" name="Ciro" />
                <Line yAxisId="right" type="monotone" dataKey="islem" stroke="#ff7300" name="İşlem Sayısı" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>
      </Card>
      
      {/* Pie Chart */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Hizmet Dağılımı</h4>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  labelLine={false}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(name) => `Hizmet: ${name}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
      
      {/* Services Table */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Hizmet Detayları</h4>
        <div className="rounded-md border">
          <ScrollArea className="h-64">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="py-2 px-4 text-left font-medium">Hizmet Adı</th>
                  <th className="py-2 px-4 text-right font-medium">İşlem Sayısı</th>
                  <th className="py-2 px-4 text-right font-medium">Ciro</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.map((service: any, index) => (
                  <tr key={service.service_id || index} className="border-t">
                    <td className="py-2 px-4">{service.service_name}</td>
                    <td className="py-2 px-4 text-right">{service.count}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(service.amount)}</td>
                  </tr>
                ))}
                {serviceData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      Bu tarih aralığında hizmet verisi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
