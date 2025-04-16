import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ServicePerformanceData } from "@/utils/performanceUtils";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryPerformanceView } from "./CategoryPerformanceView";
import {
  Bar,
  BarChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  Legend,
  CartesianGrid,
} from "recharts";

interface ServicePerformanceViewProps {
  serviceData: ServicePerformanceData[];
  categoryData?: any[];
  insights: string[];
  refreshAnalysis: () => void;
  dateRange: { from: Date; to: Date };
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', 
  '#FF8042', '#AF19FF', '#FF6B6B', '#10B981', '#2463EB', '#F59E0B', '#EC4899'
];

export function ServicePerformanceView({
  serviceData = [],
  categoryData = [],
  insights = [],
  refreshAnalysis,
  dateRange,
}: ServicePerformanceViewProps) {
  const [activeView, setActiveView] = useState<"services" | "categories">("services");
  
  const renderCustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{data.name || 'Bilinmeyen'}</p>
          <p>Ciro: {formatCurrency(data.revenue || 0)}</p>
          <p>İşlem Sayısı: {data.count || 0}</p>
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
          <p className="font-medium">{data.name || 'Bilinmeyen'}</p>
          <p>İşlem Sayısı: {data.count || 0}</p>
          <p>Ciro: {formatCurrency(data.revenue || 0)}</p>
          <p>Oran: %{(data.percentage || 0).toFixed(1)}</p>
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
          {insights.length > 0 ? (
            insights.map((insight, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="text-purple-600 text-lg">•</span>
                <span className="text-sm">{insight}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">Henüz yeterli veri bulunmamaktadır.</li>
          )}
        </ul>
      </Card>

      {/* Hizmet / Kategori Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="services" onClick={() => setActiveView("services")}>Hizmet Raporları</TabsTrigger>
          <TabsTrigger value="categories" onClick={() => setActiveView("categories")}>Kategori Raporları</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          {/* Karma Grafik: Sütunlar için Ciro, Çizgi için İşlem Sayısı */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Hizmet Bazlı Performans</h3>
            {serviceData.length > 0 ? (
              <div className="overflow-hidden">
                <ScrollArea className="h-[300px] w-full">
                  <div style={{ width: Math.max(serviceData.length * 80, 600) + 'px', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={serviceData}
                        margin={{ top: 5, right: 60, left: 20, bottom: 70 }}
                        barSize={30}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name"
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          interval={0}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          tickFormatter={(value) => `₺${value}`}
                          label={{ value: 'Ciro (₺)', angle: -90, position: 'insideLeft', offset: -5 }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          label={{ value: 'İşlem Sayısı', angle: 90, position: 'insideRight', offset: 5 }}
                        />
                        <RechartsTooltip content={renderCustomBarTooltip} />
                        <Legend wrapperStyle={{ bottom: -10 }} />
                        <Bar 
                          yAxisId="left"
                          dataKey="revenue" 
                          fill="#3b82f6" 
                          name="Ciro"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="count"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="İşlem Sayısı"
                          dot={{ r: 4 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-muted-foreground">Gösterilecek veri bulunmuyor</p>
              </div>
            )}
          </Card>

          {/* Pie Chart */}
          <Card className="p-4 mt-6">
            <h3 className="font-medium mb-4">Hizmet Dağılımı</h3>
            {serviceData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={renderCustomPieTooltip} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Gösterilecek veri bulunmuyor</p>
              </div>
            )}
          </Card>

          {/* Table */}
          <Card className="p-4 mt-6">
            <h3 className="font-medium mb-4">Hizmet Detayları</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Hizmet</th>
                    <th className="text-right p-2 w-24">İşlem Sayısı</th>
                    <th className="text-right p-2 w-24">Ciro</th>
                    <th className="text-right p-2 w-16">Oran</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceData.map((service, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{service.name}</td>
                      <td className="text-right p-2">{service.count}</td>
                      <td className="text-right p-2">{formatCurrency(service.revenue)}</td>
                      <td className="text-right p-2">%{service.percentage?.toFixed(1) || 0}</td>
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
                    <td className="text-right p-2">%100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryPerformanceView 
            operations={filteredOperations}
            dateRange={dateRange}
            refreshKey={refreshKey} // Pass the refreshKey prop
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
