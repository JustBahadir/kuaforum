
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
import { ServicePerformanceData } from "@/utils/performanceUtils";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServicePerformanceViewProps {
  serviceData: ServicePerformanceData[];
  insights: string[];
  refreshAnalysis: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#8dd1e1', '#a4de6c', '#83a6ed', '#8884d8', '#ffc658'];

export function ServicePerformanceView({ 
  serviceData,
  insights,
  refreshAnalysis
}: ServicePerformanceViewProps) {
  const renderCustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>Ciro: {formatCurrency(payload[0].value)}</p>
          <p>İşlem Sayısı: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{data.name}</p>
          <p>Ciro: {formatCurrency(data.revenue)}</p>
          <p>İşlem Sayısı: {data.count}</p>
          <p>Oran: %{data.percentage.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Akıllı Analiz */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Akıllı Analiz</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshAnalysis}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <span className="text-purple-600 text-lg">•</span>
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Karma Grafik */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">Hizmet Performansı</h3>
        <ScrollArea className="h-[300px] w-full">
          <div className="min-w-[600px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                barSize={30}
              >
                <XAxis 
                  dataKey="name"
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill="#666"
                        transform="rotate(-45)"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                  height={60}
                />
                <YAxis yAxisId="revenue" orientation="left" />
                <YAxis yAxisId="count" orientation="right" />
                <Tooltip content={renderCustomBarTooltip} />
                <Bar 
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill="#3b82f6"
                  name="Ciro"
                />
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  name="İşlem Sayısı"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Hizmet Dağılımı</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomPieTooltip} />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Hizmet Detayları</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hizmet</th>
                  <th className="text-right p-2">İşlem Sayısı</th>
                  <th className="text-right p-2">Ciro</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.map((service, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{service.name}</td>
                    <td className="text-right p-2">{service.count}</td>
                    <td className="text-right p-2">{formatCurrency(service.revenue)}</td>
                  </tr>
                ))}
                <tr className="border-t font-medium">
                  <td className="p-2">Toplam</td>
                  <td className="text-right p-2">
                    {serviceData.reduce((sum, item) => sum + item.count, 0)}
                  </td>
                  <td className="text-right p-2">
                    {formatCurrency(serviceData.reduce((sum, item) => sum + item.revenue, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
