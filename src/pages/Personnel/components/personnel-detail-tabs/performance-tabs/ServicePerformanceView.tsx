
import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
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
  Legend
} from "recharts";

interface ServicePerformanceViewProps {
  personnel: any;
}

export function ServicePerformanceView({ personnel }: ServicePerformanceViewProps) {
  // Example data - in a real implementation, this would come from the API
  const serviceData = [
    { name: "Saç Kesimi", revenue: 2500, count: 10 },
    { name: "Saç Boyama", revenue: 1800, count: 6 },
    { name: "Tıraş", revenue: 900, count: 15 },
    { name: "Manikür", revenue: 1200, count: 8 },
    { name: "Cilt Bakımı", revenue: 3000, count: 12 },
  ];

  const pieData = serviceData.map(item => ({
    name: item.name,
    value: item.revenue
  }));

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{label || payload[0].name}</p>
          <p>Ciro: {formatCurrency(payload[0].value || payload[0].payload.revenue)}</p>
          {payload[1] && <p>İşlem Sayısı: {payload[1].value}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-medium mb-4">Hizmet Performansı</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={serviceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
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
                fill="#8884d8" 
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
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-medium mb-4">Hizmet Dağılımı</h3>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
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
                  <th className="text-right py-2">Ciro</th>
                  <th className="text-right py-2">Sayı</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.sort((a, b) => b.revenue - a.revenue).map((service, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{service.name}</td>
                    <td className="text-right py-2">{formatCurrency(service.revenue)}</td>
                    <td className="text-right py-2">{service.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
