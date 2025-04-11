
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
  TooltipProps
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { YearlyStatisticsPlaceholder } from "@/pages/ShopStatistics/components/YearlyStatisticsPlaceholder";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

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
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedTab, setSelectedTab] = useState("daily");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(personnelId || null);

  // Get all personnel
  const { data: personeller = [], isLoading: personnelLoading } = useQuery({
    queryKey: ['personel-for-performance'],
    queryFn: () => personelServisi.hepsiniGetir(),
  });

  // Update selected personnel when personnelId prop changes
  useEffect(() => {
    if (personnelId) {
      setSelectedPersonnelId(personnelId);
    } else if (personeller.length > 0 && !selectedPersonnelId) {
      setSelectedPersonnelId(personeller[0].id);
    }
  }, [personnelId, personeller, selectedPersonnelId]);

  // Get operations for the selected personnel
  const { data: operationsData = [], isLoading: operationsLoading } = useQuery({
    queryKey: ['personnel-operations', selectedPersonnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!selectedPersonnelId) return [];
      
      const operations = await personelIslemleriServisi.personelIslemleriGetir(selectedPersonnelId);
      
      // Filter by date range
      return operations.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      });
    },
    enabled: !!selectedPersonnelId,
  });

  // Get details for the selected personnel
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

  // Prepare daily performance data
  const dailyData = React.useMemo(() => {
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
  }, [operationsData]);

  // Prepare service performance data
  const serviceData = React.useMemo(() => {
    if (!operationsData?.length) return [];

    const serviceMap = new Map<string, ServiceData>();
    
    operationsData.forEach(op => {
      const serviceName = op.islem?.islem_adi || op.aciklama || "Diğer";
      
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { name: serviceName, count: 0, revenue: 0 });
      }
      
      const entry = serviceMap.get(serviceName)!;
      entry.count += 1;
      entry.revenue += op.tutar || 0;
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => b.count - a.count);
  }, [operationsData]);

  // Get performance summary
  const performanceSummary = React.useMemo(() => {
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
  }, [operationsData]);

  // AI-generated insights based on data
  const aiInsights = React.useMemo(() => {
    if (!operationsData?.length || !selectedPersonnel) {
      return ["Bu personel için yeterli veri bulunmamaktadır."];
    }

    const insights = [];
    const personnelName = selectedPersonnel.ad_soyad;
    
    // Insights about operations
    if (performanceSummary.totalOperations > 0) {
      insights.push(`${personnelName}, seçilen dönemde toplam ${performanceSummary.totalOperations} işlem gerçekleştirdi.`);
    }
    
    // Insights about revenue
    if (performanceSummary.totalRevenue > 0) {
      insights.push(`${personnelName}, toplam ${formatCurrency(performanceSummary.totalRevenue)} ciro elde etti.`);
    }
    
    // Insights about most popular service
    if (serviceData.length > 0) {
      const mostPopularService = serviceData[0];
      insights.push(`En çok yaptığı işlem: ${mostPopularService.count} adet ile ${mostPopularService.name}.`);
    }
    
    // Insights about most profitable service
    if (serviceData.length > 0) {
      const mostProfitableService = [...serviceData].sort((a, b) => b.revenue - a.revenue)[0];
      insights.push(`En çok kazandıran işlem: ${formatCurrency(mostProfitableService.revenue)} ile ${mostProfitableService.name}.`);
    }
    
    // Insights about best day
    if (dailyData.length > 0) {
      const bestDay = [...dailyData].sort((a, b) => b.ciro - a.ciro)[0];
      insights.push(`En yüksek ciroyu ${bestDay.date} tarihinde ${formatCurrency(bestDay.ciro)} ile elde etti.`);
    }
    
    return insights;
  }, [operationsData, selectedPersonnel, performanceSummary, serviceData, dailyData]);

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
        
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onSelect={({from, to}) => setDateRange({from, to})}
        />
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
                        <div className="h-[300px]">
                          <h3 className="font-medium mb-2">İşlem Dağılımı</h3>
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
                                  dataKey="count"
                                  label={({ name }) => name}
                                >
                                  {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Legend />
                                <Tooltip formatter={(value, name, props) => [value, 'İşlem Sayısı']} />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        
                        <div className="h-[300px]">
                          <h3 className="font-medium mb-2">Ciro Dağılımı</h3>
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
                                  label={({ name }) => name}
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
