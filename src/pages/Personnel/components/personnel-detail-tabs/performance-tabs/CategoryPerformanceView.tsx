
import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  Legend
} from "recharts";

interface CategoryPerformanceViewProps {
  personnel: any;
}

export function CategoryPerformanceView({ personnel }: CategoryPerformanceViewProps) {
  // Example data - in a real implementation, this would come from the API
  const categoryData = [
    { name: "Saç Hizmeti", revenue: 4300, count: 16 },
    { name: "Cilt Bakımı", revenue: 3500, count: 12 },
    { name: "Makyaj", revenue: 2800, count: 10 },
    { name: "Tırnak Bakımı", revenue: 1200, count: 8 },
  ];

  const pieData = categoryData.map(item => ({
    name: item.name,
    value: item.revenue
  }));

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'];

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{payload[0].name}</p>
          <p>Ciro: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Performansı</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
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
              <Tooltip />
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
          <h3 className="font-medium mb-4">Kategori Dağılımı</h3>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
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
          <h3 className="font-medium mb-4">Kategori Detayları</h3>
          <div className="max-h-[200px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Kategori</th>
                  <th className="text-right py-2">Ciro</th>
                  <th className="text-right py-2">Sayı</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.sort((a, b) => b.revenue - a.revenue).map((category, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{category.name}</td>
                    <td className="text-right py-2">{formatCurrency(category.revenue)}</td>
                    <td className="text-right py-2">{category.count}</td>
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
