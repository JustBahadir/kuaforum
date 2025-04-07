import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface PersonnelPerformanceReportsProps {
  personnelId: number;
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [timePeriod, setTimePeriod] = useState("monthly");
  
  const { data: personel, isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ['personel-detail', personnelId],
    queryFn: async () => {
      if (!personnelId) return null;
      return await personelServisi.getirById(personnelId);
    },
    enabled: !!personnelId
  });
  
  const { data: islemler = [], isLoading: isLoadingOperations } = useQuery({
    queryKey: ['personel-islemleri', personnelId],
    queryFn: async () => {
      if (!personnelId) return [];
      return await personelIslemleriServisi.personelIslemleriGetir(personnelId);
    },
    enabled: !!personnelId
  });
  
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  
  useEffect(() => {
    if (islemler.length === 0) return;
    
    try {
      // Prepare daily data (last 7 days)
      const dailyStats = prepareDailyData(islemler);
      setDailyData(dailyStats);
      
      // Prepare monthly data (last 6 months)
      const monthlyStats = prepareMonthlyData(islemler);
      setMonthlyData(monthlyStats);
      
      // Prepare service performance data
      const serviceStats = prepareServiceData(islemler);
      setServiceData(serviceStats);
    } catch (error) {
      console.error("Error preparing personnel performance data:", error);
    }
  }, [islemler]);
  
  const prepareDailyData = (operations: any[]) => {
    // Group operations by day for the last 7 days
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      days.push({
        name: dayStr,
        ciro: 0,
        islemSayisi: 0,
        puan: 0
      });
    }
    
    // Aggregate data
    operations.forEach(op => {
      try {
        if (!op.created_at) return;
        
        const opDate = new Date(op.created_at).toISOString().split('T')[0];
        const dayItem = days.find(d => d.name === opDate);
        
        if (dayItem) {
          dayItem.ciro += (op.tutar || 0);
          dayItem.islemSayisi += 1;
          dayItem.puan += (op.puan || 0);
        }
      } catch (e) {
        console.error("Error processing operation for daily chart:", e);
      }
    });
    
    // Format dates for display
    days.forEach(day => {
      const date = new Date(day.name);
      day.name = date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    });
    
    return days;
  };
  
  const prepareMonthlyData = (operations: any[]) => {
    // Group operations by month for the last 6 months
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      
      months.push({
        name: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        month: date.getMonth(),
        year: date.getFullYear(),
        ciro: 0,
        islemSayisi: 0,
        puan: 0
      });
    }
    
    // Aggregate data
    operations.forEach(op => {
      try {
        if (!op.created_at) return;
        
        const opDate = new Date(op.created_at);
        const monthItem = months.find(m => 
          opDate.getMonth() === m.month && 
          opDate.getFullYear() === m.year
        );
        
        if (monthItem) {
          monthItem.ciro += (op.tutar || 0);
          monthItem.islemSayisi += 1;
          monthItem.puan += (op.puan || 0);
        }
      } catch (e) {
        console.error("Error processing operation for monthly chart:", e);
      }
    });
    
    return months;
  };
  
  const prepareServiceData = (operations: any[]) => {
    // Group operations by service type
    const services: Record<string, { name: string, count: number, revenue: number }> = {};
    
    operations.forEach(op => {
      const serviceName = op.aciklama || "Belirtilmemiş";
      
      if (!services[serviceName]) {
        services[serviceName] = {
          name: serviceName,
          count: 0,
          revenue: 0
        };
      }
      
      services[serviceName].count += 1;
      services[serviceName].revenue += (op.tutar || 0);
    });
    
    // Convert to array and sort by revenue
    return Object.values(services)
      .sort((a, b) => b.revenue - a.revenue);
  };
  
  const isLoading = isLoadingPersonnel || isLoadingOperations;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!personel) {
    return (
      <div className="p-4 text-center">
        <p>Personel bilgisi bulunamadı.</p>
      </div>
    );
  }
  
  // Calculate totals
  const totalRevenue = islemler.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalOperations = islemler.length;
  const totalPoints = islemler.reduce((sum, op) => sum + (op.puan || 0), 0);
  const avgPoints = totalOperations > 0 ? totalPoints / totalOperations : 0;
  const totalCommission = islemler.reduce((sum, op) => sum + (op.odenen || 0), 0);
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: any, name: string) => {
    if (name === 'ciro') {
      return [formatCurrency(value), 'Ciro'];
    }
    if (name === 'puan') {
      return [value, 'Toplam Puan'];
    }
    return [value, name === 'islemSayisi' ? 'İşlem Sayısı' : name];
  };
  
  return (
    <div className="space-y-6">
      {/* Personnel Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Toplam gelir
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">İşlem Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations}</div>
            <p className="text-xs text-muted-foreground">
              Toplam işlem adedi
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Ortalama: {avgPoints.toFixed(1)} / 5
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Kazanç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">
              %{personel.prim_yuzdesi || 0} komisyon oranı
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Charts */}
      <Card>
        <CardHeader>
          <CardTitle>{personel.ad_soyad} - Performans Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={timePeriod} onValueChange={setTimePeriod}>
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-6">
              {/* Daily Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Günlük Ciro ve İşlem Sayısı</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="ciro" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Ciro (₺)" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="islemSayisi" 
                        stroke="#82ca9d" 
                        name="İşlem Sayısı" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-6">
              {/* Weekly Performance is basically the same as daily for individual personnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Haftalık Performans</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="ciro" 
                        fill="#8884d8" 
                        name="Ciro (₺)" 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="islemSayisi" 
                        fill="#82ca9d" 
                        name="İşlem Sayısı" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Service Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">En Çok Yapılan İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={serviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {serviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={serviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#82ca9d"
                            dataKey="revenue"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {serviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-6">
              {/* Monthly Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aylık Ciro ve İşlem Sayısı</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="ciro" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Ciro (₺)" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="islemSayisi" 
                        stroke="#82ca9d" 
                        name="İşlem Sayısı" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Points Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aylık Puan Dağılımı</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="puan" 
                        fill="#FFBB28" 
                        name="Toplam Puan" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Revenue vs Operation Relationship */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">İşlem-Ciro İlişkisi</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ciro" 
                        stroke="#8884d8" 
                        name="Ciro (₺)" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
