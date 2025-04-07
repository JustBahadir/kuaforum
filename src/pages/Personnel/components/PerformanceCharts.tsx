
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelAnalyst } from '@/components/analyst/PersonnelAnalyst';

interface PerformanceChartsProps {
  personeller: any[];
  islemGecmisi: any[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare data for charts
  const prepareRevenueByPersonnel = () => {
    const data = personeller.map(personel => {
      const personelIslemleri = islemGecmisi.filter(islem => islem.personel_id === personel.id);
      const toplam = personelIslemleri.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
      
      return {
        name: personel.ad_soyad,
        value: toplam,
        original: toplam, // Keep original value for tooltip formatting
      };
    }).filter(item => item.value > 0); // Only include personnel with operations

    return data.sort((a, b) => b.value - a.value); // Sort by revenue
  };

  const prepareServiceDistribution = () => {
    const serviceMap: Record<string, { name: string, count: number, revenue: number }> = {};
    
    islemGecmisi.forEach(islem => {
      // Extract service name from description or use service name directly
      let serviceName = '';
      
      if (islem.islem && islem.islem.islem_adi) {
        serviceName = islem.islem.islem_adi;
      } else if (islem.aciklama) {
        // Clean the service name by removing any trailing text after "hizmeti verildi"
        serviceName = islem.aciklama.split(' hizmeti verildi')[0];
      }
      
      if (!serviceName) return;
      
      // Initialize or update the service in the map
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = {
          name: serviceName,
          count: 0,
          revenue: 0
        };
      }
      
      serviceMap[serviceName].count++;
      serviceMap[serviceName].revenue += (islem.tutar || 0);
    });
    
    // Convert to array and sort by count
    return Object.values(serviceMap).sort((a, b) => b.count - a.count);
  };

  const prepareMonthlyPerformance = () => {
    // Get the last 6 months
    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(month.getMonth() - i);
      months.push({
        month: month.getMonth(),
        year: month.getFullYear(),
        name: month.toLocaleDateString('tr-TR', { month: 'short' }),
        ciro: 0,
        islem: 0
      });
    }
    
    // Aggregate data by month
    islemGecmisi.forEach(islem => {
      if (!islem.created_at) return;
      
      const islemDate = new Date(islem.created_at);
      const monthItem = months.find(m => 
        islemDate.getMonth() === m.month && 
        islemDate.getFullYear() === m.year
      );
      
      if (monthItem) {
        monthItem.ciro += (islem.tutar || 0);
        monthItem.islem += 1;
      }
    });
    
    return months;
  };

  const prepareDailyPerformance = () => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const dayData = days.map(day => ({ name: day, ciro: 0, islem: 0 }));
    
    islemGecmisi.forEach(islem => {
      if (!islem.created_at) return;
      
      const date = new Date(islem.created_at);
      // Convert to 0-6 starting with Monday as 0
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      
      dayData[dayIndex].ciro += (islem.tutar || 0);
      dayData[dayIndex].islem += 1;
    });
    
    return dayData;
  };

  const revenueByPersonnel = prepareRevenueByPersonnel();
  const serviceDistribution = prepareServiceDistribution();
  const monthlyPerformance = prepareMonthlyPerformance();
  const dailyPerformance = prepareDailyPerformance();
  
  // Custom tooltip formatter for pie chart
  const customTooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <PersonnelAnalyst />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="services">Hizmet Dağılımı</TabsTrigger>
          <TabsTrigger value="time">Zaman Analizi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Personel Bazında Ciro Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {revenueByPersonnel.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByPersonnel}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {revenueByPersonnel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={customTooltipFormatter} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Henüz personel işlemi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Personel İşlem Sayısı</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {revenueByPersonnel.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={personeller.map(personel => {
                        const islemSayisi = islemGecmisi.filter(islem => islem.personel_id === personel.id).length;
                        return {
                          name: personel.ad_soyad,
                          islem: islemSayisi
                        };
                      }).filter(item => item.islem > 0)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="islem" name="İşlem Sayısı" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Henüz personel işlemi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>En Popüler Hizmetler</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {serviceDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={serviceDistribution.slice(0, 5)} // Top 5 services
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="İşlem Sayısı" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Henüz hizmet verisi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>En Kazançlı Hizmetler</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {serviceDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={serviceDistribution
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)} // Top 5 by revenue
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value as number), 'Ciro'];
                        }
                        return [value, name];
                      }} />
                      <Legend />
                      <Bar dataKey="revenue" name="Ciro" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Henüz hizmet verisi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="time">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Aylık Performans</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {monthlyPerformance.some(m => m.ciro > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'ciro') {
                          return [formatCurrency(value as number), 'Ciro'];
                        }
                        return [value, name === 'islem' ? 'İşlem Sayısı' : name];
                      }} />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="ciro" 
                        name="Ciro" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="islem" 
                        name="İşlem Sayısı" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Henüz aylık performans verisi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Günlük Performans</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {dailyPerformance.some(d => d.ciro > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'ciro') {
                          return [formatCurrency(value as number), 'Ciro'];
                        }
                        return [value, name === 'islem' ? 'İşlem Sayısı' : name];
                      }} />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="ciro" 
                        name="Ciro" 
                        fill="#8884d8" 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="islem" 
                        name="İşlem Sayısı" 
                        fill="#82ca9d" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Henüz günlük performans verisi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
