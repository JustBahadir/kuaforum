
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComboChartProps {
  data: any;
  isLoading: boolean;
  period: string;
}

export function ComboChart({ data, isLoading, period }: ComboChartProps) {
  const [chartType, setChartType] = useState<'normal' | 'stacked'>('normal');

  const chartData = useMemo(() => {
    if (isLoading || !data.operations || data.operations.length === 0) {
      return [];
    }

    const operations = data.operations;
    const dateRange = data.dateRange;
    
    const dataMap = new Map();
    
    operations.forEach((operation: any) => {
      if (!operation.created_at) return;
      
      const date = new Date(operation.created_at);
      let key;
      
      // Format the date key based on time range
      if (period === 'daily') {
        key = format(date, 'HH:00', { locale: tr });
      } else if (period === 'weekly' || (period === 'custom' && 
                dateRange.to.getTime() - dateRange.from.getTime() < 8 * 24 * 60 * 60 * 1000)) {
        key = format(date, 'EEEE', { locale: tr });
      } else if (period === 'monthly' || (period === 'custom' && 
                dateRange.to.getTime() - dateRange.from.getTime() < 32 * 24 * 60 * 60 * 1000)) {
        key = format(date, 'd MMM', { locale: tr });
      } else {
        key = format(date, 'MMM yyyy', { locale: tr });
      }
      
      if (!dataMap.has(key)) {
        dataMap.set(key, { name: key, ciro: 0, islemSayisi: 0 });
      }
      
      const entry = dataMap.get(key);
      entry.islemSayisi += 1;
      entry.ciro += operation.tutar || 0;
    });
    
    // Convert map to array and sort chronologically
    let result = Array.from(dataMap.values());

    // Sort by date if possible
    if (period === 'daily') {
      result = result.sort((a, b) => {
        const hourA = parseInt(a.name);
        const hourB = parseInt(b.name);
        return hourA - hourB;
      });
    } else if (period === 'weekly') {
      const dayOrder = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      result = result.sort((a, b) => dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name));
    } else if (period === 'monthly' || (period === 'custom' && result.length <= 31)) {
      result = result.sort((a, b) => {
        const dayA = parseInt(a.name.split(' ')[0]);
        const dayB = parseInt(b.name.split(' ')[0]);
        return dayA - dayB;
      });
    } else if (period === 'yearly') {
      const monthOrder = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      result = result.sort((a, b) => {
        const monthA = a.name.split(' ')[0];
        const monthB = b.name.split(' ')[0];
        return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
      });
    }

    return result;
  }, [data, isLoading, period]);

  // By personnel data for stacked view
  const stackedData = useMemo(() => {
    if (isLoading || !data.operations || data.operations.length === 0 || !data.personnel) {
      return {
        series: [],
        data: []
      };
    }

    const operations = data.operations;
    const personnel = data.personnel;
    const dateRange = data.dateRange;
    const personnelMap = new Map();
    
    // Create nested map: date -> personnel -> data
    const datePersonnelMap = new Map();
    
    operations.forEach((operation: any) => {
      if (!operation.created_at || !operation.personel_id) return;
      
      const date = new Date(operation.created_at);
      let dateKey;
      
      // Format the date key based on time range
      if (period === 'daily') {
        dateKey = format(date, 'HH:00', { locale: tr });
      } else if (period === 'weekly' || (period === 'custom' && 
                dateRange.to.getTime() - dateRange.from.getTime() < 8 * 24 * 60 * 60 * 1000)) {
        dateKey = format(date, 'EEEE', { locale: tr });
      } else if (period === 'monthly' || (period === 'custom' && 
                dateRange.to.getTime() - dateRange.from.getTime() < 32 * 24 * 60 * 60 * 1000)) {
        dateKey = format(date, 'd MMM', { locale: tr });
      } else {
        dateKey = format(date, 'MMM yyyy', { locale: tr });
      }
      
      // Find personnel name
      const personelObj = personnel.find((p: any) => p.id === operation.personel_id);
      const personelName = personelObj?.ad_soyad || 'Bilinmeyen';
      
      // Add personnel to map if not exists
      if (!personnelMap.has(operation.personel_id)) {
        personnelMap.set(operation.personel_id, personelName);
      }
      
      // Initialize date entry if not exists
      if (!datePersonnelMap.has(dateKey)) {
        datePersonnelMap.set(dateKey, new Map());
      }
      
      // Initialize personnel entry for date if not exists
      const personnelData = datePersonnelMap.get(dateKey);
      if (!personnelData.has(operation.personel_id)) {
        personnelData.set(operation.personel_id, { ciro: 0, islemSayisi: 0 });
      }
      
      // Update data
      const entry = personnelData.get(operation.personel_id);
      entry.islemSayisi += 1;
      entry.ciro += operation.tutar || 0;
    });
    
    // Convert nested maps to array format for recharts
    const result = [];
    const personnelArray = Array.from(personnelMap.entries()).map(([id, name]) => ({ id, name }));
    
    // Sort dates
    let dateKeys = Array.from(datePersonnelMap.keys());
    if (period === 'daily') {
      dateKeys = dateKeys.sort((a, b) => {
        const hourA = parseInt(a);
        const hourB = parseInt(b);
        return hourA - hourB;
      });
    } else if (period === 'weekly') {
      const dayOrder = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      dateKeys = dateKeys.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    } else if (period === 'monthly' || (period === 'custom' && dateKeys.length <= 31)) {
      dateKeys = dateKeys.sort((a, b) => {
        const dayA = parseInt(a.split(' ')[0]);
        const dayB = parseInt(b.split(' ')[0]);
        return dayA - dayB;
      });
    }
    
    // Build data array
    dateKeys.forEach(dateKey => {
      const personnelData = datePersonnelMap.get(dateKey);
      const entry: any = { name: dateKey, total: 0, totalCount: 0 };
      
      personnelArray.forEach(({ id, name }) => {
        const data = personnelData.get(id) || { ciro: 0, islemSayisi: 0 };
        entry[`${name}_ciro`] = data.ciro;
        entry[`${name}_count`] = data.islemSayisi;
        entry.total += data.ciro;
        entry.totalCount += data.islemSayisi;
      });
      
      result.push(entry);
    });
    
    return {
      series: personnelArray,
      data: result
    };
  }, [data, isLoading, period]);

  // Custom tooltip formatter for normal view
  const formatNormalTooltip = (value: any, name: string) => {
    if (name === "ciro") return [formatCurrency(value), "Ciro"];
    if (name === "islemSayisi") return [value, "İşlem Sayısı"];
    return [value, name];
  };

  // Custom tooltip formatter for stacked view
  const formatStackedTooltip = (value: any, name: string) => {
    if (name.endsWith('_ciro')) {
      return [formatCurrency(value), name.replace('_ciro', '')];
    }
    if (name.endsWith('_count')) {
      return [value, `${name.replace('_count', '')} (İşlem)`];
    }
    if (name === 'total') {
      return [formatCurrency(value), 'Toplam Ciro'];
    }
    if (name === 'totalCount') {
      return [value, 'Toplam İşlem'];
    }
    return [value, name];
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Ciro ve İşlem Sayısı</CardTitle>
            <Tabs defaultValue="normal" className="w-auto" value={chartType} onValueChange={(v: any) => setChartType(v)}>
              <TabsList>
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="stacked">Personel Bazlı</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Ciro ve İşlem Sayısı</CardTitle>
            <Tabs defaultValue="normal" className="w-auto" value={chartType} onValueChange={(v: any) => setChartType(v)}>
              <TabsList>
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="stacked">Personel Bazlı</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground text-center">Bu tarih aralığında veri bulunamadı</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Sayfayı Yenile</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Ciro ve İşlem Sayısı</CardTitle>
          <Tabs defaultValue="normal" className="w-auto" value={chartType} onValueChange={(v: any) => setChartType(v)}>
            <TabsList>
              <TabsTrigger value="normal">Normal</TabsTrigger>
              <TabsTrigger value="stacked">Personel Bazlı</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="h-[400px] overflow-x-auto">
          <div className="min-w-[600px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'normal' ? (
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                    domain={[0, 'auto']}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    allowDecimals={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip formatter={formatNormalTooltip} />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="ciro"
                    name="Ciro (₺)"
                    fill="#8884d8"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="islemSayisi"
                    name="İşlem Sayısı"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={stackedData.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                    domain={[0, 'auto']}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'auto']}
                    allowDecimals={false}
                  />
                  <Tooltip formatter={formatStackedTooltip} />
                  <Legend />
                  {stackedData.series.map((p: any, index: number) => (
                    <Bar 
                      key={p.id}
                      yAxisId="left"
                      dataKey={`${p.name}_ciro`}
                      name={p.name}
                      stackId="a"
                      fill={`hsl(${index * 40}, 70%, 60%)`}
                    />
                  ))}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalCount"
                    name="Toplam İşlem Sayısı"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
