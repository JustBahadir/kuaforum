import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { islemKategoriServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clipboard, TrendingDown, TrendingUp } from "lucide-react";

interface CategoryPerformanceViewProps {
  operations: any[];
  dateRange: {
    from: Date;
    to: Date;
  };
  refreshKey?: number; // Add refreshKey as optional prop
}

export function CategoryPerformanceView({ operations, dateRange, refreshKey = 0 }: CategoryPerformanceViewProps) {
  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['islem-kategorileri'],
    queryFn: () => islemKategoriServisi.hepsiniGetir(),
  });

  // Process operations by category
  const categoryData = useMemo(() => {
    // Group operations by category
    const categoryMap = new Map();
    
    operations.forEach(op => {
      if (!op.islem || !op.islem.kategori_id) return;
      
      const categoryId = op.islem.kategori_id;
      const tutar = Number(op.tutar) || 0;
      
      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId);
        existing.tutar += tutar;
        existing.islemSayisi += 1;
      } else {
        categoryMap.set(categoryId, {
          categoryId,
          tutar,
          islemSayisi: 1
        });
      }
    });
    
    // Convert map to array and add category names
    return Array.from(categoryMap.values()).map(item => {
      const category = categories.find(c => c.id === item.categoryId);
      return {
        ...item,
        name: category?.kategori_adi || 'Bilinmeyen Kategori',
        ciro: item.tutar // For chart compatibility
      };
    });
  }, [operations, categories]);
  
  // Create pie chart data
  const pieChartData = useMemo(() => {
    return categoryData.map((item, index) => ({
      name: item.name,
      value: item.tutar,
      fill: COLORS[index % COLORS.length]
    }));
  }, [categoryData]);

  // Smart analysis
  const analysis = useMemo(() => {
    if (categoryData.length === 0) return [];
    
    const insights = [];
    
    // Sort categories by revenue
    const sortedByRevenue = [...categoryData].sort((a, b) => b.tutar - a.tutar);
    const topCategory = sortedByRevenue[0];
    const totalRevenue = sortedByRevenue.reduce((sum, cat) => sum + cat.tutar, 0);
    const topCategoryPercentage = (topCategory.tutar / totalRevenue) * 100;
    
    insights.push({
      key: 'top-category',
      title: 'En Çok Kazanç Sağlayan Kategori',
      description: `"${topCategory.name}" kategorisi toplam cironun %${topCategoryPercentage.toFixed(1)}'ını oluşturuyor.`
    });
    
    // Sort by service count
    const sortedByCount = [...categoryData].sort((a, b) => b.islemSayisi - a.islemSayisi);
    const topCountCategory = sortedByCount[0];
    const totalCount = sortedByCount.reduce((sum, cat) => sum + cat.islemSayisi, 0);
    const topCountPercentage = (topCountCategory.islemSayisi / totalCount) * 100;
    
    if (topCountCategory.categoryId !== topCategory.categoryId) {
      insights.push({
        key: 'most-performed',
        title: 'En Çok Yapılan Kategori',
        description: `"${topCountCategory.name}" kategorisi en çok yapılan işlem kategorisidir (%${topCountPercentage.toFixed(1)}).`
      });
    }
    
    // Category with highest average revenue
    const withAverage = categoryData.map(cat => ({
      ...cat,
      average: cat.tutar / cat.islemSayisi
    }));
    const sortedByAverage = [...withAverage].sort((a, b) => b.average - a.average);
    const topAverageCategory = sortedByAverage[0];
    
    insights.push({
      key: 'highest-average',
      title: 'En Yüksek Ortalama Değere Sahip Kategori',
      description: `"${topAverageCategory.name}" kategorisi ortalama ${formatCurrency(topAverageCategory.average)} değerinde.`
    });
    
    return insights;
  }, [categoryData]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Analysis */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg">Akıllı Analiz</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.length > 0 ? (
            <div className="space-y-4">
              {analysis.map((insight) => (
                <div key={insight.key} className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Yeterli veri bulunamadı. Analiz için daha fazla işlem gerekiyor.</p>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bazlı Ciro ve İşlem Sayısı</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] relative overflow-x-auto">
          <div className="min-w-[600px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  height={60}
                  angle={45}
                  textAnchor="start"
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left" 
                  label={{ value: 'Ciro (₺)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'İşlem Sayısı', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'ciro') return [formatCurrency(value), 'Ciro'];
                    if (name === 'islemSayisi') return [value, 'İşlem Sayısı'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="ciro" 
                  fill="#8884d8" 
                  name="Ciro" 
                  barSize={40}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="islemSayisi" 
                  stroke="#ff7300" 
                  name="İşlem Sayısı"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend formatter={(value, entry) => `${value}: ${formatCurrency(entry.payload.value)}`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Detayları</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 w-1/2">Kategori</th>
                <th className="text-center py-2 px-2">İşlem Sayısı</th>
                <th className="text-right py-2 px-4">Ciro</th>
                <th className="text-right py-2 px-4">Ort. Tutar</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.length > 0 ? (
                categoryData.map((category, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{category.name}</td>
                    <td className="py-2 px-2 text-center">{category.islemSayisi}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(category.tutar)}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(category.tutar / category.islemSayisi)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    Bu tarih aralığında kategori verisi bulunmamaktadır.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
