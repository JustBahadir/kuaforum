
import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  CartesianGrid
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { islemServisi, kategoriServisi, personelIslemleriServisi } from "@/lib/supabase";

interface CategoryPerformanceViewProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  refreshKey?: number;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', 
  '#FF8042', '#AF19FF', '#FF6B6B', '#10B981', '#2463EB', '#F59E0B', '#EC4899'
];

export function CategoryPerformanceView({ dateRange, refreshKey = 0 }: CategoryPerformanceViewProps) {
  // Fetch operations data based on date range
  const { data: operations = [], isLoading: operationsLoading } = useQuery({
    queryKey: ["operations", dateRange.from, dateRange.to, refreshKey],
    queryFn: async () => {
      const data = await personelIslemleriServisi.hepsiniGetir();
      return data.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      });
    },
  });

  // Fetch services data
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services", refreshKey],
    queryFn: () => islemServisi.hepsiniGetir(),
  });

  // Fetch categories data
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", refreshKey],
    queryFn: () => kategoriServisi.hepsiniGetir(),
  });

  const isLoading = operationsLoading || servicesLoading || categoriesLoading;

  // Generate category data
  const categoryData = React.useMemo(() => {
    if (isLoading || operations.length === 0 || categories.length === 0) return [];

    const categoryMap = new Map();
    let totalRevenue = 0;

    operations.forEach(op => {
      const serviceId = op.islem_id;
      if (!serviceId) return;
      
      const service = services.find(s => s.id === serviceId);
      if (!service) return;
      
      const categoryId = service.kategori_id;
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      const categoryName = category.kategori_adi;
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { 
          name: categoryName, 
          count: 0, 
          revenue: 0 
        });
      }
      
      const entry = categoryMap.get(categoryName);
      entry.count += 1;
      entry.revenue += Number(op.tutar) || 0;
      totalRevenue += Number(op.tutar) || 0;
    });
    
    // Calculate percentages and prepare for visualization
    return Array.from(categoryMap.values())
      .map(item => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [operations, services, categories, isLoading]);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{payload[0].name || payload[0].payload.name}</p>
          <p>Ciro: {formatCurrency(payload[0].value || payload[0].payload.revenue)}</p>
          {payload[1] && <p>İşlem Sayısı: {payload[1].value || payload[0].payload.count}</p>}
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill="#666"
          fontSize={12}
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Bazlı Performans</h3>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : categoryData.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div style={{ width: Math.max(categoryData.length * 120, 600) + 'px', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 5, right: 60, left: 20, bottom: 70 }}
                  barSize={30}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    height={70}
                    tick={CustomXAxisTick}
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
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ bottom: -10 }} />
                  <Bar 
                    yAxisId="left"
                    dataKey="revenue" 
                    fill="#8884d8" 
                    name="Ciro"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="count" 
                    name="İşlem Sayısı" 
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">Kategori verisi bulunmuyor</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Dağılımı</h3>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : categoryData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Kategori verisi bulunmuyor</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Detayları</h3>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : categoryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Kategori</th>
                  <th className="text-right p-2 w-24">İşlem Sayısı</th>
                  <th className="text-right p-2 w-24">Ciro</th>
                  <th className="text-right p-2 w-16">Oran</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{category.name}</td>
                    <td className="text-right p-2">{category.count}</td>
                    <td className="text-right p-2">{formatCurrency(category.revenue)}</td>
                    <td className="text-right p-2">%{category.percentage?.toFixed(1) || 0}</td>
                  </tr>
                ))}
                <tr className="border-t font-medium">
                  <td className="p-2">Toplam</td>
                  <td className="text-right p-2">
                    {categoryData.reduce((sum, item) => sum + item.count, 0)}
                  </td>
                  <td className="text-right p-2">
                    {formatCurrency(categoryData.reduce((sum, item) => sum + item.revenue, 0))}
                  </td>
                  <td className="text-right p-2">%100</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">Kategori verisi bulunmuyor</p>
        )}
      </Card>
    </div>
  );
}
