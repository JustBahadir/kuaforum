
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";

// Define color constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function PerformanceCharts({ personeller, islemGecmisi }: { personeller: any[]; islemGecmisi: any[] }) {
  const [timePeriod, setTimePeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");

  // Process data for personnel charts
  const personnelPerformanceData = useMemo(() => {
    const performanceData = personeller.map((personel) => {
      const personelIslemleri = islemGecmisi.filter(
        (islem) => islem.personel_id === personel.id
      );
      
      const totalRevenue = personelIslemleri.reduce(
        (sum, islem) => sum + (islem.tutar || 0),
        0
      );
      
      const operationCount = personelIslemleri.length;
      
      const totalPaid = personelIslemleri.reduce(
        (sum, islem) => sum + (islem.odenen || 0),
        0
      );
      
      const totalPoints = personelIslemleri.reduce(
        (sum, islem) => sum + (islem.puan || 0),
        0
      );
      
      const avgPoints = operationCount > 0 ? totalPoints / operationCount : 0;
      
      return {
        name: personel.ad_soyad,
        ciro: totalRevenue,
        islemSayisi: operationCount,
        odenen: totalPaid,
        puan: totalPoints,
        ortPuan: avgPoints,
      };
    }).filter(data => data.islemSayisi > 0);
    
    return performanceData;
  }, [personeller, islemGecmisi]);

  // Calculate service distribution by personnel
  const serviceDistributionData = useMemo(() => {
    const serviceData: Record<string, Record<string, number>> = {};
    
    islemGecmisi.forEach(islem => {
      const personelId = islem.personel_id;
      const serviceName = islem.aciklama || "Belirtilmemiş";
      const personelName = personeller.find(p => p.id === personelId)?.ad_soyad || "Bilinmeyen";
      
      if (!serviceData[personelName]) {
        serviceData[personelName] = {};
      }
      
      if (!serviceData[personelName][serviceName]) {
        serviceData[personelName][serviceName] = 0;
      }
      
      serviceData[personelName][serviceName]++;
    });
    
    // Convert to format for visualization
    return Object.entries(serviceData).map(([personelName, services]) => {
      const topServices = Object.entries(services)
        .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
      
      return {
        name: personelName,
        services: topServices,
        totalServices: Object.values(services).reduce((sum, count) => sum + (count as number), 0)
      };
    });
  }, [islemGecmisi, personeller]);

  // Handle appointment cancellations
  const cancellationData = useMemo(() => {
    // This is a placeholder - in a real app, you would filter islemGecmisi
    // or get appointment data to identify canceled appointments by personnel
    return personnelPerformanceData.map(person => ({
      name: person.name,
      cancellations: Math.floor(Math.random() * 5) // Placeholder random data
    }));
  }, [personnelPerformanceData]);

  // Custom tooltip formatter
  const tooltipFormatter = (value: any, name: string) => {
    if (name === 'ciro' || name === 'odenen') {
      return [formatCurrency(value), name === 'ciro' ? 'Ciro' : 'Ödenen'];
    }
    if (name === 'ortPuan') {
      return [value.toFixed(1), 'Ortalama Puan'];
    }
    return [value, name === 'islemSayisi' ? 'İşlem Sayısı' : name];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personel Performans Raporları</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
              <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            </TabsList>
            
            <TabsContent value={timePeriod} className="space-y-6">
              {/* Revenue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ciro Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={personnelPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={tooltipFormatter} />
                        <Legend />
                        <Bar 
                          dataKey="ciro" 
                          name="Toplam Ciro" 
                          fill="#8884d8" 
                          label={{ 
                            position: 'top',
                            formatter: (value: number) => formatCurrency(value)
                          }}
                        />
                        <Bar 
                          dataKey="odenen" 
                          name="Toplam Ödenen" 
                          fill="#82ca9d" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Operation Count Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">İşlem Sayısı Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={personnelPerformanceData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="islemSayisi"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {personnelPerformanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={tooltipFormatter} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Average Points & Customer Satisfaction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Puan Ortalaması & Müşteri Memnuniyeti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={personnelPerformanceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 5]} />
                          <Tooltip formatter={tooltipFormatter} />
                          <Legend />
                          <Bar 
                            dataKey="ortPuan" 
                            name="Ortalama Puan" 
                            fill="#FFBB28" 
                            label={{ 
                              position: 'top',
                              formatter: (value: number) => value.toFixed(1)
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Service Type Distribution (Specialization Areas) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hizmet Türü Dağılımı (Uzmanlık Alanları)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {serviceDistributionData.map((personelData, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <h4 className="font-medium mb-2">{personelData.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {personelData.services.map((service, serviceIndex) => (
                            <div 
                              key={serviceIndex} 
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                            >
                              <span>{service.name}</span>
                              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                                {service.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Monthly Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aylık / Haftalık Performans Karşılaştırması</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Ocak", ...personnelPerformanceData.reduce((obj, p) => ({...obj, [p.name]: Math.round(p.ciro * 0.8 * Math.random())}), {}) },
                        { month: "Şubat", ...personnelPerformanceData.reduce((obj, p) => ({...obj, [p.name]: Math.round(p.ciro * 0.85 * Math.random())}), {}) },
                        { month: "Mart", ...personnelPerformanceData.reduce((obj, p) => ({...obj, [p.name]: Math.round(p.ciro * 0.9 * Math.random())}), {}) },
                        { month: "Nisan", ...personnelPerformanceData.reduce((obj, p) => ({...obj, [p.name]: Math.round(p.ciro * 0.95 * Math.random())}), {}) },
                        { month: "Mayıs", ...personnelPerformanceData.reduce((obj, p) => ({...obj, [p.name]: Math.round(p.ciro * 1.0 * Math.random())}), {}) },
                        { month: "Haziran", ...personnelPerformanceData.reduce((obj, p) => ({...obj, [p.name]: Math.round(p.ciro * 1.1 * Math.random())}), {}) },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      {personnelPerformanceData.map((entry, index) => (
                        <Line
                          key={`line-${index}`}
                          type="monotone"
                          dataKey={entry.name}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Canceled Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">İptal Edilen Randevular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cancellationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="cancellations" 
                          name="İptal Edilen Randevular" 
                          fill="#FF8042" 
                          label={{ 
                            position: 'top'
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
