
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface CategoryEvaluationProps {
  data: any;
  isLoading: boolean;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export function CategoryEvaluation({ data, isLoading }: CategoryEvaluationProps) {
  const [view, setView] = useState<"revenue" | "count">("revenue");

  const categoryData = useMemo(() => {
    if (isLoading || !data.operations || !data.categories) {
      return [];
    }

    const operations = data.operations;
    const categories = data.categories;
    
    const categoryMap = new Map();
    
    operations.forEach((op: any) => {
      const categoryId = op.islem?.kategori_id;
      const category = categories.find((c: any) => c.id === categoryId);
      const categoryName = category ? category.kategori_adi : "Diğer";
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { name: categoryName, revenue: 0, count: 0 });
      }
      
      const entry = categoryMap.get(categoryName);
      entry.revenue += op.tutar || 0;
      entry.count += 1;
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => view === "revenue" ? b.revenue - a.revenue : b.count - a.count);
  }, [data, isLoading, view]);
  
  // Format tooltip contents based on view
  const formatTooltip = (value: number, name: string) => {
    if (name === "revenue") {
      return [formatCurrency(value), "Ciro"];
    }
    if (name === "count") {
      return [value, "İşlem Sayısı"];
    }
    return [value, name];
  };
  
  // Pie chart label formatting
  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Kategori Değerlendirme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kategori Değerlendirme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Veri bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Kategori Değerlendirme</CardTitle>
          <Tabs defaultValue="revenue" value={view} onValueChange={(v: any) => setView(v)}>
            <TabsList>
              <TabsTrigger value="revenue">Ciro</TabsTrigger>
              <TabsTrigger value="count">İşlem Sayısı</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 p-4">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey={view}
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={100}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[280px]">
            <ScrollArea className="h-full">
              <div className="min-w-[300px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Bar
                      dataKey={view}
                      fill="#8884d8"
                      radius={[0, 4, 4, 0]}
                    >
                      {categoryData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
