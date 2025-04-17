
import React, { useMemo } from "react";
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

interface CategoryData {
  name: string;
  count: number;
  revenue: number;
}

interface CategoryPerformanceViewProps {
  operations: any[];
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

export function CategoryPerformanceView({
  operations,
  refreshAnalysis,
  dateRange,
}: CategoryPerformanceViewProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  
  const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
    "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
  ];
  
  // Process category data from operations
  const categoryData = useMemo(() => {
    if (!operations || operations.length === 0) return [];

    const categories: { [key: string]: CategoryData } = {};
    
    operations.forEach(op => {
      // Try to get category name from the operation record
      const categoryName = op.islem?.kategori?.kategori_adi || 
                          (op.islem_id ? "Diğer" : "Tanımsız");
      
      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          count: 0,
          revenue: 0
        };
      }
      
      categories[categoryName].count += 1;
      categories[categoryName].revenue += Number(op.tutar) || 0;
    });
    
    return Object.values(categories).sort((a, b) => b.revenue - a.revenue);
  }, [operations]);
  
  const hasData = categoryData && categoryData.length > 0;

  // Generate insights based on category data
  const insights = useMemo(() => {
    if (!hasData) return [];
    
    const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);
    const topCategory = categoryData[0];
    const lowCategory = categoryData[categoryData.length - 1];
    
    // Calculate percentage of top category
    const topCategoryPercentage = ((topCategory.revenue / totalRevenue) * 100).toFixed(1);
    
    const insights = [
      `En çok gelir ${topCategory.name} kategorisinden gelmiş (toplam cironun %${topCategoryPercentage}'i).`,
      `${topCategory.name} kategorisinde ${topCategory.count} işlem yapılmış.`,
      `${lowCategory.name} kategorisi en düşük performansı gösteriyor.`
    ];
    
    // Add insight about category distribution if there are multiple categories
    if (categoryData.length > 1) {
      const secondCategory = categoryData[1];
      const secondCategoryPercentage = ((secondCategory.revenue / totalRevenue) * 100).toFixed(1);
      
      insights.push(`${secondCategory.name} ikinci en yüksek kategori (%${secondCategoryPercentage}).`);
    }
    
    // Add insight about average transaction value per category
    const highestAvg = [...categoryData].sort((a, b) => 
      (b.revenue/b.count) - (a.revenue/a.count))[0];
      
    insights.push(`${highestAvg.name} kategorisinde işlem başına ortalama gelir en yüksek: ${formatCurrency(highestAvg.revenue/highestAvg.count)}.`);
    
    return insights;
  }, [categoryData, hasData]);
  
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
        {/* Category Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="flex justify-center items-center h-[300px] w-full overflow-visible">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
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
                      {categoryData.map((entry, index) => (
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

        {/* Category Analysis */}
        <AnalystBox
          title="Kategori Analizi" 
          insights={insights}
          hasEnoughData={hasData}
          onRefresh={refreshAnalysis}
        />
      </div>

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Kategori</th>
                  <th className="py-2 text-right font-medium">İşlem Sayısı</th>
                  <th className="py-2 text-right font-medium">Ciro</th>
                </tr>
              </thead>
              <tbody>
                {hasData ? (
                  categoryData.map((category, index) => (
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
                          {category.name}
                        </div>
                      </td>
                      <td className="py-2 text-right">{category.count}</td>
                      <td className="py-2 text-right">{formatCurrency(category.revenue)}</td>
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
