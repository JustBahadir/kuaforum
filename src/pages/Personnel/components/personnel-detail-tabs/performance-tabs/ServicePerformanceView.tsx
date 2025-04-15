
import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bar,
  BarChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts";

interface ServicePerformanceViewProps {
  personnel: any;
  dateRange?: {
    from: Date;
    to: Date;
  };
  refreshKey?: number;
}

export function ServicePerformanceView({ 
  personnel, 
  dateRange, 
  refreshKey = 0 
}: ServicePerformanceViewProps) {
  // Example data - in a real implementation, this would be fetched from API
  const serviceData = [
    { name: "Saç Kesimi", revenue: 800, count: 8 },
    { name: "Saç Boyama", revenue: 600, count: 4 },
    { name: "Yüz Maskesi", revenue: 550, count: 5 },
    { name: "Cilt Bakımı", revenue: 500, count: 4 },
    { name: "Ense Tıraş", revenue: 450, count: 9 },
  ];

  const pieData = serviceData.map(item => ({
    name: item.name,
    value: item.revenue
  }));

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#ffc658'];

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          <p>Ciro: {formatCurrency(payload[0].value)}</p>
          {payload[1] && <p>İşlem Sayısı: {payload[1].value}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <Card className="p-4">
        <h3 className="font-medium mb-4">Hizmet Performansı</h3>
        <ScrollArea className="h-[300px] w-full">
          <div className="min-w-[600px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                barSize={60} // Narrower bars as requested
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="revenue" orientation="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="count" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip content={renderCustomTooltip} />
                <Bar 
                  yAxisId="revenue" 
                  dataKey="revenue" 
                  name="Ciro" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="count" 
                  type="monotone" 
                  dataKey="count" 
                  name="İşlem Sayısı" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-medium mb-4">Hizmet Dağılımı</h3>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={0}  // Changed to 0 for filled pie chart
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value.toLocaleString('tr-TR')} ₺`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString('tr-TR')} ₺`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-4">Hizmet Detayları</h3>
          <div className="max-h-[200px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Hizmet</th>
                  <th className="text-right py-2">İşlem Sayısı</th>
                  <th className="text-right py-2">Ciro</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.sort((a, b) => b.revenue - a.revenue).map((service, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{service.name}</td>
                    <td className="text-right py-2">{service.count}</td>
                    <td className="text-right py-2">{formatCurrency(service.revenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-medium border-t">
                <tr>
                  <td className="py-2">Toplam</td>
                  <td className="text-right py-2">
                    {serviceData.reduce((sum, item) => sum + item.count, 0)}
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(serviceData.reduce((sum, item) => sum + item.revenue, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
