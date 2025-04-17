
import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AnalystBox } from "@/components/analyst/AnalystBox";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ServiceData {
  name: string;
  count: number;
  revenue: number;
}

interface ServicePerformanceViewProps {
  serviceData: ServiceData[];
  insights: string[];
  refreshAnalysis: () => void;
  dateRange: { from: Date, to: Date };
}

// Custom tooltip component for highlighting information on hover
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-md border rounded-md">
        <p className="font-medium">{data.name}</p>
        <p>İşlem: {data.count}</p>
        <p>Ciro: {formatCurrency(data.revenue)}</p>
      </div>
    );
  }
  return null;
};

export function ServicePerformanceView({
  serviceData,
  insights,
  refreshAnalysis,
  dateRange,
}: ServicePerformanceViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
    "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
  ];
  
  const hasData = serviceData && serviceData.length > 0;
  
  // Sort service data by revenue for better visualization
  const sortedServiceData = useMemo(() => {
    if (!serviceData) return [];
    
    return [...serviceData].sort((a, b) => b.revenue - a.revenue);
  }, [serviceData]);

  // Handle chart segment activation
  const handlePieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const handlePieLeave = () => {
    setActiveIndex(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hizmet Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="flex justify-center items-center h-[300px] w-full overflow-visible">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sortedServiceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      onMouseEnter={handlePieEnter}
                      onMouseLeave={handlePieLeave}
                    >
                      {sortedServiceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke={activeIndex === index ? "#fff" : "none"}
                          strokeWidth={activeIndex === index ? 2 : 0}
                          style={{
                            filter: activeIndex === index ? "brightness(1.1)" : "none",
                            outline: activeIndex === index ? "none" : "none",
                            opacity: activeIndex === null || activeIndex === index ? 1 : 0.7,
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                Seçilen tarih aralığında veri bulunamadı
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Analysis */}
        <AnalystBox
          title="Performans Analizi" 
          insights={insights}
          hasEnoughData={hasData}
          onRefresh={refreshAnalysis}
        />
      </div>

      {/* Service Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Hizmet</th>
                  <th className="py-2 text-right font-medium">İşlem Sayısı</th>
                  <th className="py-2 text-right font-medium">Ciro</th>
                </tr>
              </thead>
              <tbody>
                {hasData ? (
                  sortedServiceData.map((service, index) => (
                    <tr 
                      key={index} 
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-2 text-left">
                        <div className="flex items-center">
                          <span 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}  
                          />
                          {service.name}
                        </div>
                      </td>
                      <td className="py-2 text-right">{service.count}</td>
                      <td className="py-2 text-right">{formatCurrency(service.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      Seçilen tarih aralığında veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
