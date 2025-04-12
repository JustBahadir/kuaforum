
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { personelServisi, personelIslemleriServisi } from "@/lib/supabase";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, InfoIcon } from "lucide-react";
import { YearlyStatisticsPlaceholder } from "@/pages/ShopStatistics/components/YearlyStatisticsPlaceholder";
import { PersonelIslemi as PersonelIslemiType } from "@/lib/supabase/types";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

interface PersonelIslemi extends PersonelIslemiType {
  personel_id: number;
  created_at: string;
}

interface PersonnelPerformanceReportsProps {
  personnelId?: number | null;
}

interface PerformanceData {
  date: string;
  islemSayisi: number;
  ciro: number;
}

interface ServiceData {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedTab, setSelectedTab] = useState("daily");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(personnelId || null);
  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);

  const { data: personeller = [], isLoading: personnelLoading } = useQuery({
    queryKey: ['personel-for-performance'],
    queryFn: () => personelServisi.hepsiniGetir(),
  });

  useEffect(() => {
    if (personnelId) {
      setSelectedPersonnelId(personnelId);
    } else if (personeller.length > 0 && !selectedPersonnelId) {
      setSelectedPersonnelId(personeller[0].id);
    }
  }, [personnelId, personeller, selectedPersonnelId]);

  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
  };

  const handleMonthCycleChange = (day: number, date: Date) => {
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

  const { data: operationsData = [], isLoading: operationsLoading } = useQuery({
    queryKey: ['personnel-operations', selectedPersonnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!selectedPersonnelId) return [];
      
      const operations = await personelIslemleriServisi.personelIslemleriGetir(selectedPersonnelId);
      
      return operations.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      });
    },
    enabled: !!selectedPersonnelId,
  });

  const { data: selectedPersonnel, isLoading: selectedPersonnelLoading } = useQuery({
    queryKey: ['selected-personnel-details', selectedPersonnelId],
    queryFn: async () => {
      if (!selectedPersonnelId) return null;
      return personelServisi.getirById(selectedPersonnelId);
    },
    enabled: !!selectedPersonnelId,
  });

  const handlePersonnelChange = (personnelId: string) => {
    setSelectedPersonnelId(Number(personnelId));
  };

  const dailyData = useState(() => {
    if (!operationsData?.length) return [];

    const dailyMap = new Map<string, PerformanceData>();
    
    operationsData.forEach(op => {
      if (!op.created_at) return;
      
      const date = new Date(op.created_at);
      const dateStr = date.toLocaleDateString('tr-TR');
      
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { date: dateStr, islemSayisi: 0, ciro: 0 });
      }
      
      const entry = dailyMap.get(dateStr)!;
      entry.islemSayisi += 1;
      entry.ciro += op.tutar || 0;
    });

    return Array.from(dailyMap.values()).sort((a, b) => {
      const dateA = new Date(a.date.split('.').reverse().join('-'));
      const dateB = new Date(b.date.split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  })[0];

  const serviceData = useState(() => {
    if (!operationsData?.length) return [];

    const serviceMap = new Map<string, ServiceData>();
    let totalRevenue = 0;
    let totalOperations = 0;
    
    operationsData.forEach(op => {
      const serviceName = op.islem?.islem_adi || op.aciklama || "Diğer";
      
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { name: serviceName, count: 0, revenue: 0 });
      }
      
      const entry = serviceMap.get(serviceName)!;
      entry.count += 1;
      entry.revenue += op.tutar || 0;
      
      totalRevenue += op.tutar || 0;
      totalOperations += 1;
    });
    
    // Calculate percentages and prepare for visualization
    const result = Array.from(serviceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(item => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
      }));
    
    // Group small items into "Other" if there are more than 5 services
    if (result.length > 5) {
      const topItems = result.slice(0, 4);
      const otherItems = result.slice(4);
      
      const otherGroup: ServiceData = {
        name: "Diğer",
        count: otherItems.reduce((sum, item) => sum + item.count, 0),
        revenue: otherItems.reduce((sum, item) => sum + item.revenue, 0),
        percentage: otherItems.reduce((sum, item) => sum + (item.percentage || 0), 0)
      };
      
      return [...topItems, otherGroup];
    }
    
    return result;
  })[0];

  const performanceSummary = useState(() => {
    if (!operationsData?.length) {
      return { totalOperations: 0, totalRevenue: 0, averageRevenue: 0 };
    }
    
    const totalOperations = operationsData.length;
    const totalRevenue = operationsData.reduce((sum, op) => sum + (op.tutar || 0), 0);
    
    return {
      totalOperations,
      totalRevenue,
      averageRevenue: totalRevenue / totalOperations,
    };
  })[0];

  const aiInsights = useState(() => {
    if (!operationsData?.length || !selectedPersonnel) {
      return ["Bu personel için yeterli veri bulunmamaktadır."];
    }

    const insights = [];
    const personnelName = selectedPersonnel.ad_soyad;
    
    if (performanceSummary.totalOperations > 0) {
      insights.push(`${personnelName}, seçilen dönemde toplam ${performanceSummary.totalOperations} işlem gerçekleştirdi.`);
    }
    
    if (performanceSummary.totalRevenue > 0) {
      insights.push(`${personnelName}, toplam ${formatCurrency(performanceSummary.totalRevenue)} ciro elde etti.`);
    }
    
    if (serviceData.length > 0) {
      const mostPopularService = serviceData[0];
      insights.push(`En çok yaptığı işlem: ${mostPopularService.count} adet ile ${mostPopularService.name}.`);
    }
    
    if (serviceData.length > 0) {
      const mostProfitableService = [...serviceData].sort((a, b) => b.revenue - a.revenue)[0];
      insights.push(`En çok kazandıran işlem: ${formatCurrency(mostProfitableService.revenue)} ile ${mostProfitableService.name}.`);
    }
    
    if (dailyData.length > 0) {
      const bestDay = [...dailyData].sort((a, b) => b.ciro - a.ciro)[0];
      insights.push(`En yüksek ciroyu ${bestDay.date} tarihinde ${formatCurrency(bestDay.ciro)} ile elde etti.`);
    }
    
    return insights;
  })[0];

  const isLoading = personnelLoading || operationsLoading || selectedPersonnelLoading;
  const hasNoData = !isLoading && operationsData.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full sm:w-64">
          <Select 
            value={selectedPersonnelId?.toString()} 
            onValueChange={handlePersonnelChange}
            disabled={isLoading || personeller.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Personel seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {personeller.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.ad_soyad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
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

      {selectedPersonnel && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{selectedPersonnel.ad_soyad}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">İşlem Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performanceSummary.totalOperations}</div>
                <p className="text-sm text-muted-foreground">Seçili tarih aralığında</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Toplam Ciro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(performanceSummary.totalRevenue)}
                </div>
                <p className="text-sm text-muted-foreground">Seçili tarih aralığında</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Ortalama İşlem Tutarı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(performanceSummary.averageRevenue)}
                </div>
                <p className="text-sm text-muted-foreground">İşlem başına ortalama</p>
              </CardContent>
            </Card>
          </div>

          {hasNoData ? (
            <YearlyStatisticsPlaceholder />
          ) : (
            <>
              <Tabs defaultValue="daily" className="space-y-6" value={selectedTab} onValueChange={setSelectedTab}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <CardTitle>Performans Grafiği</CardTitle>
                      <TabsList>
                        <TabsTrigger value="daily">Günlük</TabsTrigger>
                        <TabsTrigger value="services">Hizmet Analizi</TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <TabsContent value="daily" className="mt-0">
                      <div className="h-[400px]">
                        {isLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                          </div>
                        ) : dailyData.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Bu personel için yeterli veri bulunmamaktadır.</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={dailyData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                angle={-45} 
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis 
                                yAxisId="left"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `₺${value}`}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip 
                                formatter={(value: any, name: string) => {
                                  if (name === "ciro") return [formatCurrency(value as number), "Ciro"];
                                  return [value, "İşlem Sayısı"];
                                }}
                              />
                              <Legend />
                              <Bar 
                                yAxisId="left" 
                                dataKey="ciro" 
                                fill="#8884d8" 
                                name="Ciro" 
                              />
                              <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="islemSayisi" 
                                stroke="#82ca9d" 
                                name="İşlem Sayısı"
                                strokeWidth={2} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="services" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">İşlem Dağılımı</h3>
                            <TooltipProvider>
                              <TooltipUI>
                                <TooltipTrigger>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Her bir işlem tipi için yapılan toplam işlem sayısı. Çok sayıda az tekrarlanan işlem varsa, bunlar "Diğer" kategorisinde toplanır.
                                  </p>
                                </TooltipContent>
                              </TooltipUI>
                            </TooltipProvider>
                          </div>
                          
                          <div className="h-[300px]">
                            {isLoading ? (
                              <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                              </div>
                            ) : serviceData.length === 0 ? (
                              <div className="h-full flex items-center justify-center">
                                <p className="text-muted-foreground">Bu personel için yeterli veri bulunmamaktadır.</p>
                              </div>
                            ) : (
                              <div className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={serviceData}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="count"
                                    >
                                      {serviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip formatter={(value, name, props) => [value, 'İşlem Sayısı']} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                          
                          {serviceData.find(item => item.name === "Diğer") && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1">"Diğer" kategorisi içeriği:</h4>
                              <div className="bg-gray-50 p-2 rounded text-xs max-h-28 overflow-y-auto">
                                {serviceData.find(item => item.name === "Diğer")?.details?.map((detail, index) => (
                                  <div key={index} className="flex justify-between py-1">
                                    <span>{detail.name}</span>
                                    <span>{detail.count} işlem</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Ciro Dağılımı</h3>
                            <TooltipProvider>
                              <TooltipUI>
                                <TooltipTrigger>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Her bir işlem tipinin toplam ciroya katkısı. Grafikteki büyük dilimler en çok gelir getiren işlemleri gösterir.
                                  </p>
                                </TooltipContent>
                              </TooltipUI>
                            </TooltipProvider>
                          </div>
                          
                          <div className="h-[300px]">
                            {isLoading ? (
                              <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                              </div>
                            ) : serviceData.length === 0 ? (
                              <div className="h-full flex items-center justify-center">
                                <p className="text-muted-foreground">Bu personel için yeterli veri bulunmamaktadır.</p>
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={serviceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="revenue"
                                  >
                                    {serviceData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Legend />
                                  <Tooltip formatter={(value, name, props) => [formatCurrency(value as number), 'Ciro']} />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">İşlem Detayları</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-2">İşlem</th>
                                <th className="text-right p-2">Sayı</th>
                                <th className="text-right p-2">Toplam Ciro</th>
                                <th className="text-right p-2">Oran</th>
                              </tr>
                            </thead>
                            <tbody>
                              {serviceData.map((service, index) => (
                                <tr key={index} className="border-t">
                                  <td className="p-2">{service.name}</td>
                                  <td className="text-right p-2">{service.count}</td>
                                  <td className="text-right p-2">{formatCurrency(service.revenue)}</td>
                                  <td className="text-right p-2">%{service.percentage?.toFixed(1)}</td>
                                </tr>
                              ))}
                              <tr className="border-t font-medium">
                                <td className="p-2">Toplam</td>
                                <td className="text-right p-2">{performanceSummary.totalOperations}</td>
                                <td className="text-right p-2">{formatCurrency(performanceSummary.totalRevenue)}</td>
                                <td className="text-right p-2">%100</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Card>
              </Tabs>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Akıllı Analiz</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                    </div>
                  ) : aiInsights.length > 0 ? (
                    <ul className="space-y-2">
                      {aiInsights.map((insight, i) => (
                        <li key={i} className="flex items-baseline gap-2">
                          <span className="text-purple-600 text-lg">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Alert>
                      <CircleAlert className="h-4 w-4" />
                      <AlertDescription>
                        Bu personel için yeterli veri bulunmamaktadır.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
