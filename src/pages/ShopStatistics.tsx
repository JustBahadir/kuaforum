import { useState, useEffect, useMemo } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { islemServisi, kategoriServisi, personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { formatCurrency, debounce } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { tr } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnalystBox } from "@/components/analyst/AnalystBox";
import { Loader2 } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

// Color scheme for charts
const CHART_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export default function ShopStatistics() {
  const { dukkanId } = useCustomerAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState("month");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  
  // Fetch personnel data
  const { data: personnel = [], isLoading: isPersonnelLoading } = useQuery({
    queryKey: ['personnel'],
    queryFn: () => personelServisi.hepsiniGetir(),
  });
  
  // Fetch operations data
  const { data: operations = [], isLoading: isOperationsLoading } = useQuery({
    queryKey: ['operations', dateRange.from, dateRange.to],
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
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => islemServisi.hepsiniGetir(),
  });
  
  // Fetch categories data
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => kategoriServisi.hepsiniGetir(),
  });

  const isLoading = isPersonnelLoading || isOperationsLoading || isServicesLoading || isCategoriesLoading;
  
  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    
    const now = new Date();
    let from, to;
    
    switch(value) {
      case 'day':
        from = new Date(now.setHours(0, 0, 0, 0));
        to = new Date();
        break;
      case 'week':
        from = startOfWeek(now, { weekStartsOn: 1 });
        to = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      default: // custom range, don't change
        return;
    }
    
    setDateRange({ from, to });
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: { from: Date, to: Date }) => {
    setDateRange(range);
    setTimeRange('custom');
  };
  
  // Transform operations data by date for performance chart
  const performanceData = useMemo(() => {
    if (isLoading || operations.length === 0) return [];
    
    const dataMap = new Map();
    
    operations.forEach(operation => {
      if (!operation.created_at) return;
      
      const date = new Date(operation.created_at);
      let key;
      
      // Format the date key based on time range
      if (timeRange === 'day') {
        key = format(date, 'HH:00', { locale: tr });
      } else if (timeRange === 'week' || timeRange === 'custom' && dateRange.to.getTime() - dateRange.from.getTime() < 8 * 24 * 60 * 60 * 1000) {
        key = format(date, 'EEEE', { locale: tr });
      } else if (timeRange === 'month' || timeRange === 'custom' && dateRange.to.getTime() - dateRange.from.getTime() < 32 * 24 * 60 * 60 * 1000) {
        key = format(date, 'd MMM', { locale: tr });
      } else {
        key = format(date, 'MMM yyyy', { locale: tr });
      }
      
      if (!dataMap.has(key)) {
        dataMap.set(key, { name: key, operations: 0, revenue: 0 });
      }
      
      const entry = dataMap.get(key);
      entry.operations += 1;
      entry.revenue += operation.tutar || 0;
    });
    
    // Convert map to array and sort by date
    return Array.from(dataMap.values());
  }, [operations, timeRange, dateRange]);
  
  // Transform operations data by service for service chart
  const serviceData = useMemo(() => {
    if (isLoading || operations.length === 0) return [];
    
    const dataMap = new Map();
    
    operations.forEach(operation => {
      const serviceId = operation.islem_id;
      if (!serviceId) return;
      
      const service = services.find(s => s.id === serviceId);
      if (!service) return;
      
      const serviceName = service.islem_adi;
      
      if (!dataMap.has(serviceName)) {
        dataMap.set(serviceName, { 
          name: serviceName, 
          count: 0, 
          revenue: 0 
        });
      }
      
      const entry = dataMap.get(serviceName);
      entry.count += 1;
      entry.revenue += operation.tutar || 0;
    });
    
    // Convert map to array and sort by revenue
    return Array.from(dataMap.values())
      .sort((a, b) => b.revenue - a.revenue);
  }, [operations, services]);
  
  // Transform operations data by category
  const categoryData = useMemo(() => {
    if (isLoading || operations.length === 0) return [];
    
    const categoryMap: Record<string, { value: number; count: number }> = {};
    
    filteredOperations.forEach(op => {
      const categoryId = op.islem?.kategori_id;
      const category = categories.find(c => c.id === categoryId);
      const categoryName = category ? category.kategori_adi : 'Diğer';
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { value: 0, count: 0 };
      }
      
      categoryMap[categoryName].value += op.tutar || 0;
      categoryMap[categoryName].count += 1;
    });
    
    return Object.entries(categoryMap).map(([name, { value, count }]) => ({
      name,
      value,
      count
    }));
  }, [operations, categories, filteredOperations, isLoading]);
  
  // Filter operations based on date range
  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      if (!operation.created_at) return false;
      const date = new Date(operation.created_at);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [operations, dateRange]);
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
    const totalOperations = filteredOperations.length;
    const averageTicket = totalOperations > 0 ? totalRevenue / totalOperations : 0;
    
    return { totalRevenue, totalOperations, averageTicket };
  }, [filteredOperations]);

  // Function to generate AI insights
  const generateAiInsights = () => {
    setIsAiLoading(true);
    
    try {
      const insights = [];
      
      // If no data, return empty insights
      if (filteredOperations.length === 0) {
        setAiInsights([]);
        setIsAiLoading(false);
        return;
      }
      
      // Most revenue service
      if (serviceData.length > 0) {
        const topService = serviceData[0];
        insights.push(`En yüksek ciro "${topService.name}" hizmetinden geldi (${formatCurrency(topService.revenue)}).`);
      }
      
      // Most popular service by count
      const sortedByCount = [...serviceData].sort((a, b) => b.count - a.count);
      if (sortedByCount.length > 0) {
        insights.push(`En çok tercih edilen hizmet "${sortedByCount[0].name}" oldu (${sortedByCount[0].count} işlem).`);
      }
      
      // Least popular service
      if (sortedByCount.length > 2) {
        const leastPopular = sortedByCount[sortedByCount.length - 1];
        insights.push(`En az tercih edilen hizmet "${leastPopular.name}" oldu (${leastPopular.count} işlem).`);
      }
      
      // Busiest day or time period
      if (performanceData.length > 0) {
        const busiestPeriod = [...performanceData].sort((a, b) => b.operations - a.operations)[0];
        
        let timeLabel;
        if (timeRange === 'day') timeLabel = 'saat';
        else if (timeRange === 'week') timeLabel = 'gün';
        else if (timeRange === 'month') timeLabel = 'gün';
        else timeLabel = 'ay';
        
        insights.push(`En yoğun ${timeLabel} "${busiestPeriod.name}" oldu (${busiestPeriod.operations} işlem).`);
      }
      
      // Period with highest revenue
      if (performanceData.length > 0) {
        const highestRevenuePeriod = [...performanceData].sort((a, b) => b.revenue - a.revenue)[0];
        insights.push(`En yüksek ciro "${highestRevenuePeriod.name}" döneminde elde edildi (${formatCurrency(highestRevenuePeriod.revenue)}).`);
      }

      // Most productive personnel
      const personnelStats = new Map();
      filteredOperations.forEach(op => {
        if (!op.personel_id) return;
        
        if (!personnelStats.has(op.personel_id)) {
          const person = personnel.find(p => p.id === op.personel_id);
          personnelStats.set(op.personel_id, { 
            name: person ? person.ad_soyad : 'Bilinmeyen Personel', 
            operations: 0,
            revenue: 0
          });
        }
        
        const entry = personnelStats.get(op.personel_id);
        entry.operations += 1;
        entry.revenue += op.tutar || 0;
      });
      
      if (personnelStats.size > 0) {
        const topPersonByOps = Array.from(personnelStats.values())
          .sort((a, b) => b.operations - a.operations)[0];
          
        const topPersonByRevenue = Array.from(personnelStats.values())
          .sort((a, b) => b.revenue - a.revenue)[0];
        
        insights.push(`En çok işlem yapan personel ${topPersonByOps.name} (${topPersonByOps.operations} işlem).`);
        insights.push(`En yüksek ciroyu getiren personel ${topPersonByRevenue.name} (${formatCurrency(topPersonByRevenue.revenue)}).`);
      }
      
      // Randomize and limit insights
      const shuffledInsights = [...insights].sort(() => 0.5 - Math.random());
      setAiInsights(shuffledInsights.slice(0, 4));
      
    } catch (error) {
      console.error("Error generating insights:", error);
      setAiInsights(["Veri analizi sırasında bir sorun oluştu."]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate insights when data changes
  useEffect(() => {
    if (!isLoading) {
      generateAiInsights();
    }
  }, [filteredOperations, timeRange]);
  
  // Format ToolTip
  const formatTooltip = (value: number, name: string) => {
    if (name === 'revenue') {
      return [formatCurrency(value), 'Ciro'];
    }
    return [value, 'İşlem Sayısı'];
  };
  
  const refreshInsights = debounce(() => {
    setIsAiLoading(true);
    generateAiInsights();
  }, 300);

  const hasEnoughData = filteredOperations.length > 0;

  return (
    <StaffLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Dükkan İstatistikleri</h1>
        
        <AnalystBox
          title="Akıllı Analiz"
          insights={aiInsights}
          isLoading={isAiLoading}
          onRefresh={refreshInsights}
          hasEnoughData={hasEnoughData}
          className="mb-6"
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zaman aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Günlük</SelectItem>
                <SelectItem value="week">Haftalık</SelectItem>
                <SelectItem value="month">Aylık</SelectItem>
                <SelectItem value="year">Yıllık</SelectItem>
                <SelectItem value="custom">Özel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={handleDateRangeChange}
          />
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Toplam İşlem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOperations}</div>
              <p className="text-sm text-muted-foreground">Seçili tarih aralığında</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Toplam Ciro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-sm text-muted-foreground">Seçili tarih aralığında</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Ortalama Fiş</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(stats.averageTicket)}</div>
              <p className="text-sm text-muted-foreground">İşlem başına ortalama</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performans Grafiği</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : performanceData.length === 0 ? (
              <div className="flex justify-center items-center h-[400px]">
                <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
              </div>
            ) : (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      tickFormatter={(value) => `₺${value}`}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === "revenue") return [formatCurrency(value as number), "Ciro"];
                        return [value, "İşlem Sayısı"];
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="revenue" 
                      fill="#8884d8" 
                      name="Ciro" 
                      barSize={30} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="operations" 
                      stroke="#82ca9d" 
                      name="İşlem Sayısı"
                      strokeWidth={2} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Service Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hizmet Performansı</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : serviceData.length === 0 ? (
              <div className="flex justify-center items-center h-[400px]">
                <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
              </div>
            ) : (
              <div className="h-[400px] overflow-x-auto">
                <div style={{ width: `max(100%, ${serviceData.length * 80}px)` }} className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={serviceData}
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
                        tickFormatter={(value) => `₺${value}`}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          if (name === "revenue") return [formatCurrency(value as number), "Ciro"];
                          return [value, "İşlem Sayısı"];
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="revenue" 
                        fill="#8884d8" 
                        name="Ciro"
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#ff7300" 
                        name="İşlem Sayısı"
                        strokeWidth={2} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
            
        {/* Category distribution and revenue source charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
                  
          <Card>
            <CardHeader>
              <CardTitle>İşlem Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : serviceData.length === 0 ? (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
