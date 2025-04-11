
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface PerformanceChartsProps {
  personeller?: any[];
  islemGecmisi?: any[];
}

export function PerformanceCharts({ personeller = [], islemGecmisi = [] }: PerformanceChartsProps) {
  const [displayMode, setDisplayMode] = useState<"daily" | "weekly" | "monthly">("daily");

  // Calculate personnel performance data
  const personnelPerformanceData = personeller.map(personel => {
    const personelIslemler = islemGecmisi.filter(islem => islem.personel_id === personel.id);
    const totalRevenue = personelIslemler.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
    const operationsCount = personelIslemler.length;
    const totalPoints = personelIslemler.reduce((sum, islem) => sum + (islem.puan || 0), 0);
    
    return {
      name: personel.ad_soyad,
      revenue: totalRevenue,
      operations: operationsCount,
      points: totalPoints,
      id: personel.id
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Group operations by category for the categories chart
  const categoryCounts = islemGecmisi.reduce((acc: Record<string, { count: number, revenue: number }>, islem) => {
    const categoryId = islem.islem?.kategori_id;
    const categoryName = islem.islem?.kategori?.kategori_adi || "Diğer";
    const revenue = islem.tutar || 0;
    
    if (!acc[categoryName]) {
      acc[categoryName] = { count: 0, revenue: 0 };
    }
    
    acc[categoryName].count += 1;
    acc[categoryName].revenue += revenue;
    
    return acc;
  }, {});

  const popularCategoriesData = Object.entries(categoryCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => b.count - a.count);

  const revenueCategoriesData = Object.entries(categoryCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Custom colors
  const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", 
    "#0088fe", "#00C49F", "#FFBB28", "#FF8042"
  ];

  // Custom tick renderer function for x-axis labels
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
          fontSize={12}
          dominantBaseline="central"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Personel Performans Karşılaştırması</CardTitle>
          <CardDescription>Personellerin toplam ciro ve işlem sayısı karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={personnelPerformanceData}
                margin={{ top: 20, right: 30, left: 90, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'auto']} />
                <YAxis 
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value as number), 'Toplam Ciro'];
                    if (name === 'operations') return [Math.round(Number(value)), 'İşlem Sayısı'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  name="Toplam Ciro (₺)" 
                  barSize={20} 
                  fill="#82ca9d"
                >
                  {personnelPerformanceData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Line
                  dataKey="operations"
                  name="İşlem Sayısı"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zaman Bazlı Performans</CardTitle>
          <div className="flex justify-between items-center">
            <CardDescription>Seçilen zaman aralığına göre personel performansı</CardDescription>
            <Tabs defaultValue={displayMode} onValueChange={(v) => setDisplayMode(v as any)}>
              <TabsList>
                <TabsTrigger value="daily">Günlük</TabsTrigger>
                <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                <TabsTrigger value="monthly">Aylık</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={personnelPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  height={60}
                  tick={renderCustomAxisTick}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  tickFormatter={(value) => `₺${value}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.2))]}
                  allowDecimals={false}
                />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue') return [formatCurrency(value as number), 'Ciro'];
                  if (name === 'operations') return [Math.round(Number(value)), 'İşlem Sayısı'];
                  return [value, name];
                }} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  name="Ciro (₺)" 
                  fill="#8884d8" 
                  barSize={30}
                >
                  {personnelPerformanceData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="operations" 
                  name="İşlem Sayısı" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>En Popüler Kategoriler</CardTitle>
          <CardDescription>İşlem sayısına göre en popüler kategoriler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={popularCategoriesData.slice(0, 7)}
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }} 
                  width={100}
                />
                <Tooltip formatter={(value) => Math.round(Number(value))} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="İşlem Sayısı" 
                  fill="#8884d8"
                >
                  {popularCategoriesData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>En Kazançlı Kategoriler</CardTitle>
          <CardDescription>Toplam ciroya göre en kazançlı kategoriler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={revenueCategoriesData.slice(0, 7)}
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `₺${value}`} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }} 
                  width={100}
                />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  name="Toplam Ciro" 
                  fill="#82ca9d"
                >
                  {revenueCategoriesData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
