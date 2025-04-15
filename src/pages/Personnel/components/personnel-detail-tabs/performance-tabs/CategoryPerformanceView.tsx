
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, kategoriServisi } from "@/lib/supabase";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Sector } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface CategoryPerformanceViewProps {
  personnel: any;
  dateRange: { from: Date; to: Date };
  refreshKey: number;
}

export function CategoryPerformanceView({ personnel, dateRange, refreshKey }: CategoryPerformanceViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [categoryMap, setCategoryMap] = useState<Map<number, string>>(new Map());

  // Fetch all categories for mapping
  const { data: categories = [] } = useQuery({
    queryKey: ['kategoriler_for_performance'],
    queryFn: () => kategoriServisi.hepsiniGetir()
  });

  // Fetch personnel operations
  const { data: personelIslemleri = [] } = useQuery({
    queryKey: ['personel_islemleri_category', personnel.id, dateRange.from, dateRange.to, refreshKey],
    queryFn: async () => {
      const data = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
      
      // Filter by date range
      return data.filter((islem: any) => {
        if (!islem.created_at) return false;
        const islemDate = new Date(islem.created_at);
        return islemDate >= dateRange.from && islemDate <= dateRange.to;
      });
    }
  });

  // Create a mapping of category IDs to names
  useEffect(() => {
    const mapping = new Map<number, string>();
    categories.forEach((category: any) => {
      mapping.set(category.id, category.kategori_adi);
    });
    setCategoryMap(mapping);
  }, [categories]);

  useEffect(() => {
    // Process personel işlemleri grouped by category
    const categoryData = new Map();
    
    personelIslemleri.forEach((islem: any) => {
      const categoryId = islem.islem?.kategori_id;
      const categoryName = categoryId ? categoryMap.get(categoryId) || "Diğer" : "Kategorisiz";
      
      if (!categoryData.has(categoryName)) {
        categoryData.set(categoryName, {
          name: categoryName,
          count: 0,
          revenue: 0,
        });
      }
      
      const category = categoryData.get(categoryName);
      category.count += 1;
      category.revenue += (islem.tutar || 0);
    });
    
    // Convert to arrays for charts
    const categoriesArray = Array.from(categoryData.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(item => ({
        ...item,
        revenue: Number(item.revenue.toFixed(2))
      }));
    
    setCategoryData(categoriesArray);
    
    // Create pie chart data
    const totalRevenue = categoriesArray.reduce((sum, item) => sum + item.revenue, 0);
    
    const pieChartData = categoriesArray.map(item => ({
      name: item.name,
      value: item.revenue,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue * 100).toFixed(1) : 0
    }));
    
    setPieData(pieChartData);
  }, [personelIslemleri, categoryMap, dateRange, refreshKey]);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Generate colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#A4DE6C'];

  const getColor = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Kategori Bazlı Performans</h4>
        <ScrollArea className="h-[300px]">
          <div className="w-full pr-4" style={{ minWidth: categoryData.length * 100 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tickMargin={8}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    return name === 'revenue' 
                      ? formatCurrency(value) 
                      : value;
                  }} 
                  labelFormatter={(label) => `Kategori: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    return value === 'revenue' ? 'Ciro' : 'İşlem Sayısı';
                  }}
                />
                <Bar dataKey="count" name="İşlem Sayısı" fill="#8884d8" barSize={40} />
                <Bar dataKey="revenue" name="Ciro" fill="#82ca9d" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Kategori Dağılımı</h4>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onTouchStart={onPieEnter}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(index)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string, props: any) => {
                    const percentage = props.payload.percentage;
                    return [`${formatCurrency(value)} (${percentage}%)`, name];
                  }}
                  labelFormatter={() => ''}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Kategori Dağılımı Açıklama</h4>
          <div className="space-y-1">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(index) }} />
                <span>{item.name} - %{item.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Kategori Detayları</h4>
        <div className="border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Adı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem Sayısı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciro</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.length > 0 ? (
                categoryData.map((category, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{category.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{category.count}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(category.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-center text-gray-500">
                    Bu tarih aralığında kategori verisi bulunamadı
                  </td>
                </tr>
              )}
              {categoryData.length > 0 && (
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-2 text-sm">Toplam</td>
                  <td className="px-4 py-2 text-sm">
                    {categoryData.reduce((sum, item) => sum + item.count, 0)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {formatCurrency(categoryData.reduce((sum, item) => sum + item.revenue, 0))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
