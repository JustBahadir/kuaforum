import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

interface PerformanceChartsProps {
  personeller: any[];
  islemGecmisi: any[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const [sortBy, setSortBy] = useState('ciro');
  const [selectedTab, setSelectedTab] = useState('comparison');

  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
  };

  const handleMonthCycleChange = (day: number) => {
    setMonthCycleDay(day);
    
    const currentDate = new Date();
    const selectedDay = day;
    
    let fromDate = new Date();
    
    // Set to previous month's cycle day
    fromDate.setDate(selectedDay);
    if (currentDate.getDate() < selectedDay) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    // Create the end date (same day, current month)
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    
    setDateRange({
      from: fromDate,
      to: toDate
    });
    
    setUseMonthCycle(true);
  };

  const filteredOperations = useMemo(() => {
    return islemGecmisi.filter(op => {
      if (!op.created_at) return false;
      const date = new Date(op.created_at);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [islemGecmisi, dateRange]);

  const personnelPerformance = useMemo(() => {
    const performanceMap = new Map();
    
    personeller.forEach(person => {
      performanceMap.set(person.id, {
        id: person.id,
        name: person.ad_soyad,
        ciro: 0,
        islemSayisi: 0,
        prim: 0
      });
    });
    
    filteredOperations.forEach(op => {
      if (!op.personel_id) return;
      if (!performanceMap.has(op.personel_id)) return;
      
      const entry = performanceMap.get(op.personel_id);
      entry.ciro += Number(op.tutar) || 0;
      entry.islemSayisi += 1;
      entry.prim += Number(op.odenen) || 0;
    });
    
    return Array.from(performanceMap.values())
      .filter(entry => entry.islemSayisi > 0)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [filteredOperations, personeller, sortBy]);

  const servicePerformance = useMemo(() => {
    const serviceMap = new Map();
    
    filteredOperations.forEach(op => {
      if (!op.islem?.islem_adi) return;
      
      const serviceName = op.islem.islem_adi;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, {
          name: serviceName,
          ciro: 0,
          islemSayisi: 0,
          prim: 0
        });
      }
      
      const entry = serviceMap.get(serviceName);
      entry.ciro += Number(op.tutar) || 0;
      entry.islemSayisi += 1;
      entry.prim += Number(op.odenen) || 0;
    });
    
    return Array.from(serviceMap.values())
      .sort((a, b) => b.ciro - a.ciro);
  }, [filteredOperations]);

  const timeSeriesData = useMemo(() => {
    const timeMap = new Map();
    
    filteredOperations.forEach(op => {
      if (!op.created_at) return;
      
      const date = new Date(op.created_at);
      const dateStr = date.toLocaleDateString('tr-TR');
      
      if (!timeMap.has(dateStr)) {
        timeMap.set(dateStr, {
          date: dateStr,
          ciro: 0,
          islemSayisi: 0,
          prim: 0
        });
      }
      
      const entry = timeMap.get(dateStr);
      entry.ciro += Number(op.tutar) || 0;
      entry.islemSayisi += 1;
      entry.prim += Number(op.odenen) || 0;
    });
    
    return Array.from(timeMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.date.split('.').reverse().join('-'));
        const dateB = new Date(b.date.split('.').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredOperations]);

  const summaryMetrics = useMemo(() => {
    const totalRevenue = filteredOperations.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0);
    const totalCommission = filteredOperations.reduce((sum, op) => sum + (Number(op.odenen) || 0), 0);
    const totalOperations = filteredOperations.length;
    const averageTicket = totalOperations > 0 ? totalRevenue / totalOperations : 0;
    
    return {
      totalRevenue,
      totalCommission,
      totalOperations,
      averageTicket
    };
  }, [filteredOperations]);

  const aiInsights = useMemo(() => {
    const insights = [];
    
    if (personnelPerformance.length === 0) {
      return ["Bu dönem için yeterli veri bulunmamaktadır."];
    }
    
    if (personnelPerformance.length > 0) {
      const topByRevenue = personnelPerformance[0];
      insights.push(`En yüksek ciroyu ${topByRevenue.name} elde etti (${formatCurrency(topByRevenue.ciro)}).`);
    }
    
    const topByOps = [...personnelPerformance].sort((a, b) => b.islemSayisi - a.islemSayisi)[0];
    insights.push(`En fazla işlemi ${topByOps.name} gerçekleştirdi (${topByOps.islemSayisi} işlem).`);
    
    if (servicePerformance.length > 0) {
      const topService = servicePerformance[0];
      insights.push(`En çok gelir getiren hizmet: ${topService.name} (${formatCurrency(topService.ciro)}).`);
    }
    
    if (timeSeriesData.length > 0) {
      const mostProductiveDay = [...timeSeriesData].sort((a, b) => b.islemSayisi - a.islemSayisi)[0];
      insights.push(`En yoğun gün: ${mostProductiveDay.date} (${mostProductiveDay.islemSayisi} işlem).`);
    }
    
    if (personnelPerformance.length > 1) {
      const totalRevenue = personnelPerformance.reduce((sum, p) => sum + p.ciro, 0);
      const topRevenue = personnelPerformance[0].ciro;
      const percentage = Math.round((topRevenue / totalRevenue) * 100);
      insights.push(`Toplam cironun %${percentage}'i ${personnelPerformance[0].name} tarafından sağlandı.`);
    }
    
    return insights;
  }, [personnelPerformance, servicePerformance, timeSeriesData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sıralama Kriteri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ciro">Ciroya Göre</SelectItem>
            <SelectItem value="islemSayisi">İşlem Sayısına Göre</SelectItem>
            <SelectItem value="prim">Prime Göre</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          {!useMonthCycle && (
            <DateRangePicker 
              from={dateRange.from}
              to={dateRange.to}
              onSelect={handleDateRangeChange}
            />
          )}
          
          <CustomMonthCycleSelector 
            selectedDay={monthCycleDay}
            onChange={handleMonthCycleChange}
            active={useMonthCycle}
            onClear={() => setUseMonthCycle(false)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryMetrics.totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalOperations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Toplam Prim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summaryMetrics.totalCommission)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Ortalama İşlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summaryMetrics.averageTicket)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Akıllı Analiz</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOperations.length === 0 ? (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seçili tarih aralığında veri bulunamadı.
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="space-y-2">
              {aiInsights.map((insight, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="text-purple-600 text-lg">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="comparison">Personel Karşılaştırma</TabsTrigger>
          <TabsTrigger value="timeline">Zaman Serisi</TabsTrigger>
          <TabsTrigger value="services">Hizmet Analizi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Personel Performans Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent>
              {personnelPerformance.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Seçili tarih aralığında veri bulunamadı</p>
                </div>
              ) : (
                <div className="h-[400px] overflow-x-auto">
                  <div style={{ minWidth: '600px', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={personnelPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value, name) => {
                          if (name === "ciro" || name === "prim") {
                            return [formatCurrency(value as number), name === "ciro" ? "Ciro" : "Prim"];
                          }
                          return [value, "İşlem Sayısı"];
                        }} />
                        <Legend />
                        <Bar dataKey="ciro" name="Ciro" fill="#8884d8" />
                        <Bar dataKey="islemSayisi" name="İşlem Sayısı" fill="#82ca9d" />
                        <Bar dataKey="prim" name="Prim" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Personel</th>
                      <th className="p-2 text-right">İşlem Sayısı</th>
                      <th className="p-2 text-right">Ciro</th>
                      <th className="p-2 text-right">Prim</th>
                      <th className="p-2 text-right">Ortalama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelPerformance.map((person, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                        <td className="p-2 font-medium">{person.name}</td>
                        <td className="p-2 text-right">{person.islemSayisi}</td>
                        <td className="p-2 text-right">{formatCurrency(person.ciro)}</td>
                        <td className="p-2 text-right">{formatCurrency(person.prim)}</td>
                        <td className="p-2 text-right">
                          {person.islemSayisi > 0 
                            ? formatCurrency(person.ciro / person.islemSayisi) 
                            : formatCurrency(0)}
                        </td>
                      </tr>
                    ))}
                    {personnelPerformance.length > 0 && (
                      <tr className="border-t-2 font-medium">
                        <td className="p-2">Toplam</td>
                        <td className="p-2 text-right">{summaryMetrics.totalOperations}</td>
                        <td className="p-2 text-right">{formatCurrency(summaryMetrics.totalRevenue)}</td>
                        <td className="p-2 text-right">{formatCurrency(summaryMetrics.totalCommission)}</td>
                        <td className="p-2 text-right">{formatCurrency(summaryMetrics.averageTicket)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Zaman Serisi Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Seçili tarih aralığında veri bulunamadı</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `₺${value}`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "ciro" || name === "prim") {
                            return [formatCurrency(value as number), name === "ciro" ? "Ciro" : "Prim"];
                          }
                          return [value, "İşlem Sayısı"];
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="ciro" 
                        name="Ciro" 
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="islemSayisi" 
                        name="İşlem Sayısı" 
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="prim" 
                        name="Prim" 
                        stroke="#ffc658"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              {servicePerformance.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Seçili tarih aralığında veri bulunamadı</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">İşlem Sayısına Göre Hizmetler</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={servicePerformance.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="islemSayisi"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {servicePerformance.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}`, 'İşlem Sayısı']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Ciroya Göre Hizmetler</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={servicePerformance.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#82ca9d"
                            dataKey="ciro"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {servicePerformance.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ciro']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Hizmet</th>
                      <th className="p-2 text-right">İşlem Sayısı</th>
                      <th className="p-2 text-right">Ciro</th>
                      <th className="p-2 text-right">Prim</th>
                      <th className="p-2 text-right">Ortalama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicePerformance.map((service, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                        <td className="p-2 font-medium">{service.name}</td>
                        <td className="p-2 text-right">{service.islemSayisi}</td>
                        <td className="p-2 text-right">{formatCurrency(service.ciro)}</td>
                        <td className="p-2 text-right">{formatCurrency(service.prim)}</td>
                        <td className="p-2 text-right">
                          {service.islemSayisi > 0 
                            ? formatCurrency(service.ciro / service.islemSayisi) 
                            : formatCurrency(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
