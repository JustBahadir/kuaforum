
import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { islemServisi, kategoriServisi, personelIslemleriServisi } from "@/lib/supabase";
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

interface CategoryPerformanceViewProps {
  dateRange: { from: Date; to: Date };
  refreshKey: number;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', 
  '#FF8042', '#AF19FF', '#FF6B6B', '#10B981', '#2463EB', '#F59E0B', '#EC4899'
];

export function CategoryPerformanceView({
  dateRange,
  refreshKey
}: CategoryPerformanceViewProps) {
  const [insights, setInsights] = useState<string[]>([]);
  
  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => kategoriServisi.hepsiniGetir(),
  });
  
  // Fetch operations
  const { data: operations = [], isLoading: isOperationsLoading } = useQuery({
    queryKey: ['category-operations', dateRange.from, dateRange.to, refreshKey],
    queryFn: async () => {
      const data = await personelIslemleriServisi.hepsiniGetir();
      return data.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      });
    },
  });

  // Fetch services for mapping
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => islemServisi.hepsiniGetir(),
  });
  
  const isLoading = isCategoriesLoading || isOperationsLoading || isServicesLoading;

  // Process category data
  const categoryData = useMemo(() => {
    if (isLoading || categories.length === 0 || operations.length === 0) return [];
    
    const categoryMap = new Map();
    
    // Initialize with all categories (so we show zero counts too)
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.kategori_adi,
        count: 0,
        revenue: 0,
        percentage: 0
      });
    });
    
    // Process each operation
    operations.forEach(op => {
      // Find the service to get its category
      const service = services.find(s => s.id === op.islem_id);
      if (!service || !service.kategori_id) return;
      
      const categoryId = service.kategori_id;
      
      // If this category wasn't initialized (shouldn't happen with our setup)
      if (!categoryMap.has(categoryId)) {
        const category = categories.find(c => c.id === categoryId);
        categoryMap.set(categoryId, {
          id: categoryId,
          name: category ? category.kategori_adi : 'Bilinmeyen Kategori',
          count: 0,
          revenue: 0,
          percentage: 0
        });
      }
      
      // Update the category data
      const categoryData = categoryMap.get(categoryId);
      categoryData.count += 1;
      categoryData.revenue += Number(op.tutar) || 0;
    });
    
    // Convert to array
    const result = Array.from(categoryMap.values());
    
    // Calculate percentages
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    result.forEach(item => {
      item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    });
    
    // Sort by revenue
    return result.sort((a, b) => b.revenue - a.revenue);
  }, [categories, operations, services, isLoading]);
  
  const generateInsights = () => {
    const newInsights = [];
    
    if (categoryData.length === 0) {
      setInsights(['Henüz yeterli veri bulunmamaktadır.']);
      return;
    }
    
    // Top revenue category
    const topCategory = categoryData[0];
    if (topCategory) {
      newInsights.push(`En yüksek ciro "${topCategory.name}" kategorisinden geldi (${formatCurrency(topCategory.revenue)}).`);
    }
    
    // Most popular category by count
    const sortedByCount = [...categoryData].sort((a, b) => b.count - a.count);
    if (sortedByCount.length > 0) {
      const popularCategory = sortedByCount[0];
      newInsights.push(`En çok işlem yapılan kategori "${popularCategory.name}" oldu (${popularCategory.count} işlem).`);
    }
    
    // Category distribution
    if (categoryData.length > 1) {
      const totalRevenueFromTop3 = categoryData
        .slice(0, Math.min(3, categoryData.length))
        .reduce((sum, cat) => sum + cat.revenue, 0);
        
      const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);
      
      if (totalRevenue > 0) {
        const percentage = (totalRevenueFromTop3 / totalRevenue) * 100;
        newInsights.push(`İlk 3 kategori toplam cironun %${percentage.toFixed(1)}'ını oluşturuyor.`);
      }
    }
    
    // Low performing categories
    const lowCategories = categoryData.filter(cat => cat.count === 0);
    if (lowCategories.length > 0) {
      newInsights.push(`${lowCategories.length} kategoride hiç işlem yapılmamış.`);
    }
    
    // Selected period summary
    newInsights.push(`Seçili dönemde toplam ${formatCurrency(categoryData.reduce((sum, cat) => sum + cat.revenue, 0))} ciro elde edildi.`);
    
    setInsights(newInsights);
  };
  
  // Generate insights when data changes
  React.useEffect(() => {
    if (!isLoading) {
      generateInsights();
    }
  }, [categoryData, isLoading, refreshKey, dateRange]);

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
            onClick={generateInsights}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : insights.length > 0 ? (
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
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : categoryData.length > 0 ? (
          <div className="overflow-hidden">
            <ScrollArea className="h-[300px] w-full">
              <div style={{ width: Math.max(categoryData.length * 120, 600) + 'px', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 5, right: 60, left: 20, bottom: 70 }}
                    barSize={40}
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
        <h3 className="font-medium mb-4">Kategori Dağılımı</h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
        <h3 className="font-medium mb-4">Kategori Detayları</h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
