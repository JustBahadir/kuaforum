
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ComposedChart,
  Area
} from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, subDays, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["#9b87f5", "#7E69AB", "#D6BCFA", "#E5DEFF"];

interface PersonnelPerformanceProps {
  personnelId: number | string;
}

export function PersonnelPerformance({ personnelId }: PersonnelPerformanceProps) {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      const result = await personelIslemleriServisi.personelIslemleriGetir(Number(personnelId));
      // Filter by date range
      return result.filter(op => {
        if (!op.created_at) return false;
        const opDate = new Date(op.created_at);
        return opDate >= dateRange.from && opDate <= dateRange.to;
      });
    },
    enabled: !!personnelId
  });

  // Calculate performance metrics
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);
  const operationCount = operations.length;
  const avgRevenue = operationCount ? totalRevenue / operationCount : 0;
  const commissionRate = totalRevenue ? (totalCommission / totalRevenue) * 100 : 0;
  
  // Prepare daily data
  const prepareDailyData = () => {
    if (!operations.length) return [];
    
    // Create empty days structure
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      displayDate: format(day, 'dd MMM', { locale: tr }),
      revenue: 0,
      commission: 0,
      count: 0,
      points: 0
    }));
    
    // Fill with actual data
    operations.forEach(op => {
      if (!op.created_at) return;
      
      const dateStr = format(new Date(op.created_at), 'yyyy-MM-dd');
      const dayData = days.find(d => d.date === dateStr);
      
      if (dayData) {
        dayData.revenue += (op.tutar || 0);
        dayData.commission += (op.odenen || 0);
        dayData.count += 1;
        dayData.points += (op.puan || 0);
      }
    });
    
    return days;
  };
  
  // Prepare monthly data
  const prepareMonthlyData = () => {
    if (!operations.length) return [];
    
    // Create empty months structure
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to }).map(month => ({
      month: format(month, 'yyyy-MM'),
      displayMonth: format(month, 'MMMM yyyy', { locale: tr }),
      revenue: 0,
      commission: 0,
      count: 0,
      points: 0
    }));
    
    // Fill with actual data
    operations.forEach(op => {
      if (!op.created_at) return;
      
      const monthStr = format(new Date(op.created_at), 'yyyy-MM');
      const monthData = months.find(m => m.month === monthStr);
      
      if (monthData) {
        monthData.revenue += (op.tutar || 0);
        monthData.commission += (op.odenen || 0);
        monthData.count += 1;
        monthData.points += (op.puan || 0);
      }
    });
    
    return months;
  };

  // Prepare service type distribution data
  const prepareServiceData = () => {
    const serviceMap = new Map();
    
    operations.forEach(op => {
      const serviceName = op.islem?.islem_adi || op.aciklama || 'Diğer';
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, {
          name: serviceName,
          value: 0,
          revenue: 0,
          count: 0
        });
      }
      
      const serviceData = serviceMap.get(serviceName);
      serviceData.value += (op.tutar || 0);
      serviceData.revenue += (op.tutar || 0);
      serviceData.count += 1;
    });
    
    return Array.from(serviceMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  };

  const dailyData = prepareDailyData();
  const monthlyData = prepareMonthlyData();
  const serviceData = prepareServiceData();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!operations.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <h3 className="text-lg font-medium mb-2">Bu personele ait performans verisi bulunmamaktadır</h3>
        <p>Seçilen tarih aralığında yapılmış işlem kaydı yok.</p>
        <div className="flex justify-center mt-4">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={({from, to}) => setDateRange({from, to})}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Performans Analizi</h2>
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={({from, to}) => setDateRange({from, to})}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">
              Toplam İşlem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{operationCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">
              Toplam Ciro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">
              Toplam Kazanç
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCommission)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-muted-foreground">
              Toplam Puan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Günlük</TabsTrigger>
          <TabsTrigger value="monthly">Aylık</TabsTrigger>
          <TabsTrigger value="services">Hizmetler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Ciro ve Kazanç</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                    interval={Math.ceil(dailyData.length / 10)}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Tarih: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Ciro" 
                    fill="#9b87f5" 
                    barSize={20}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commission" 
                    name="Kazanç" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Günlük İşlem Sayısı ve Puanlar</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                    interval={Math.ceil(dailyData.length / 10)}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="count" 
                    name="İşlem Sayısı" 
                    fill="#7E69AB" 
                    barSize={20}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="points" 
                    name="Puanlar" 
                    stroke="#2196F3" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Ciro ve Kazanç</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayMonth" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Ciro" fill="#9b87f5" />
                  <Bar dataKey="commission" name="Kazanç" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Aylık İşlem Sayısı ve Puanlar</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayMonth" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="count" 
                    name="İşlem Sayısı" 
                    fill="#7E69AB" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="points" 
                    name="Puanlar" 
                    stroke="#2196F3" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En Çok Yapılan İşlemler (Ciro Bazında)</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                <div className="border rounded-lg p-4 h-full overflow-auto">
                  <h3 className="text-lg font-semibold mb-4">İşlem Dağılımı</h3>
                  <div className="space-y-4">
                    {serviceData.map((service, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate">{service.name}</span>
                          <span>{service.count} işlem</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Toplam ciro:</span>
                          <span className="font-medium text-purple-600">{formatCurrency(service.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.round((service.revenue / totalRevenue) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
