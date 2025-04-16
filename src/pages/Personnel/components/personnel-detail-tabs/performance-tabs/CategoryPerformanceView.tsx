
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { islemServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
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
  ComposedChart,
} from "recharts";

interface CategoryData {
  id: number;
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface CategoryPerformanceViewProps {
  dateRange: { from: Date; to: Date };
  refreshKey: number;
  operations?: any[];
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', 
  '#FF8042', '#AF19FF', '#FF6B6B', '#10B981', '#2463EB', '#F59E0B', '#EC4899'
];

export function CategoryPerformanceView({
  dateRange,
  refreshKey,
  operations = [],
}: CategoryPerformanceViewProps) {
  const [insights, setInsights] = useState<string[]>([]);

  // Get categories and services
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['islem-kategorileri'],
    queryFn: async () => {
      const { kategoriServisi } = await import('@/lib/supabase');
      return kategoriServisi.hepsiniGetir();
    }
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const isLoading = categoriesLoading || servicesLoading;

  // Process category data
  const categoryData = useMemo(() => {
    if (isLoading || operations.length === 0) return [];

    // Create a map of category ID to category data
    const categoryMap = new Map<number, CategoryData>();
    
    // Initialize categories
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.kategori_adi,
        count: 0,
        revenue: 0,
        percentage: 0
      });
    });

    // Process operations
    let totalRevenue = 0;
    operations.forEach(operation => {
      const service = services.find(s => s.id === operation.islem_id);
      if (service && service.kategori_id) {
        const categoryId = service.kategori_id;
        const category = categoryMap.get(categoryId);
        
        if (category) {
          category.count += 1;
          category.revenue += operation.tutar || 0;
          totalRevenue += operation.tutar || 0;
        }
      }
    });

    // Calculate percentages and sort
    const result = Array.from(categoryMap.values())
      .filter(category => category.count > 0)
      .map(category => ({
        ...category,
        percentage: totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Generate insights
    if (result.length > 0) {
      const newInsights = [];
      const topCategory = result[0];
      newInsights.push(`En yüksek ciro "${topCategory.name}" kategorisinden geldi (${formatCurrency(topCategory.revenue)}).`);
      
      const mostServicesCategory = [...result].sort((a, b) => b.count - a.count)[0];
      newInsights.push(`En çok işlem yapılan kategori "${mostServicesCategory.name}" oldu (${mostServicesCategory.count} işlem).`);
      
      if (result.length >= 3) {
        const top3Revenue = result.slice(0, 3).reduce((sum, category) => sum + category.percentage, 0);
        newInsights.push(`İlk 3 kategori toplam cironun %${top3Revenue.toFixed(1)}'ını oluşturuyor.`);
      }
      
      const noServiceCategories = categories.length - result.length;
      if (noServiceCategories > 0) {
        newInsights.push(`${noServiceCategories} kategoride hiç işlem yapılmamış.`);
      }
      
      newInsights.push(`Seçili dönemde toplam ${formatCurrency(totalRevenue)} ciro elde edildi.`);
      
      setInsights(newInsights);
    } else {
      setInsights(['Seçilen dönemde hiç işlem bulunmuyor.']);
    }

    return result;
  }, [operations, categories, services, isLoading]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Akıllı Analiz */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Akıllı Analiz</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setInsights([...insights])} // Force refresh
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

      {/* Karma Grafik: Sütunlar için Ciro, Çizgi için İşlem Sayısı */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Bazlı Performans</h3>
        {categoryData.length > 0 ? (
          <div className="overflow-hidden">
            <ScrollArea className="h-[300px] w-full">
              <div style={{ width: Math.max(categoryData.length * 100, 600) + 'px', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={categoryData}
                    margin={{ top: 5, right: 60, left: 20, bottom: 70 }}
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
                      barSize={30}
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
                  </ComposedChart>
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
      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Dağılımı</h3>
        {categoryData.length > 0 ? (
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
      <Card className="p-4">
        <h3 className="font-medium mb-4">Kategori Detayları</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 w-[30%]">Kategori</th>
                <th className="text-right p-2 w-[20%]">İşlem Sayısı</th>
                <th className="text-right p-2 w-[25%]">Ciro</th>
                <th className="text-right p-2 w-[15%]">Oran</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 truncate">{category.name}</td>
                  <td className="text-right p-2">{category.count}</td>
                  <td className="text-right p-2">{formatCurrency(category.revenue)}</td>
                  <td className="text-right p-2">%{category.percentage.toFixed(1)}</td>
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
      </Card>
    </div>
  );
}
