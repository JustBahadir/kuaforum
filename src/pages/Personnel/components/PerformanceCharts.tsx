
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateControlBar } from "@/components/ui/date-control-bar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, InfoIcon, BarChart3 } from "lucide-react";
import { 
  TooltipProvider, 
  TooltipContent, 
  TooltipTrigger, 
  Tooltip as UITooltip 
} from "@/components/ui/tooltip";

interface Personnel {
  id: number;
  ad_soyad: string;
  prim_yuzdesi: number;
  calisma_sistemi: string;
}

interface Operation {
  id: number;
  personel_id: number;
  tutar: number;
  created_at: string;
  islem?: {
    islem_adi: string;
    kategori?: {
      id: number;
      kategori_adi: string;
    }
  }
}

interface PerformanceChartsProps {
  personeller: Personnel[];
  islemGecmisi: Operation[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<number[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);

  // Initialize with all personnel selected
  useEffect(() => {
    if (personeller?.length && selectedPersonnelIds.length === 0) {
      setSelectedPersonnelIds(personeller.map(p => p.id));
    }
  }, [personeller]);

  // Filter operations based on date range and selected personnel
  useEffect(() => {
    if (islemGecmisi.length === 0) return;

    const filtered = islemGecmisi.filter(op => {
      const opDate = new Date(op.created_at);
      const isInDateRange = opDate >= dateRange.from && opDate <= dateRange.to;
      const isSelectedPersonnel = selectedPersonnelIds.includes(op.personel_id);
      return isInDateRange && isSelectedPersonnel;
    });

    setFilteredOperations(filtered);
  }, [islemGecmisi, dateRange, selectedPersonnelIds]);

  const togglePersonnel = (personnelId: number) => {
    setSelectedPersonnelIds(prev => {
      if (prev.includes(personnelId)) {
        return prev.filter(id => id !== personnelId);
      } else {
        return [...prev, personnelId];
      }
    });
  };

  // Calculate performance data for personnel comparison chart
  const personnelComparisonData = personeller
    .filter(p => selectedPersonnelIds.includes(p.id))
    .map(p => {
      // Calculate statistics for this personnel
      const personnelOperations = filteredOperations.filter(op => op.personel_id === p.id);
      const operationCount = personnelOperations.length;
      const totalRevenue = personnelOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
      
      // Calculate commission based on personnel's commission rate
      const commissionRate = p.prim_yuzdesi / 100;
      const commission = p.calisma_sistemi === "komisyon" 
        ? totalRevenue * commissionRate 
        : 0;
        
      const netRevenue = totalRevenue - commission;
      
      return {
        name: p.ad_soyad,
        ciro: totalRevenue,
        prim: commission,
        net: netRevenue,
        islemSayisi: operationCount,
        ortalamaCiro: operationCount > 0 ? totalRevenue / operationCount : 0,
      };
    })
    .sort((a, b) => b.ciro - a.ciro);

  // Generate radar chart data with normalized values
  const generateRadarData = () => {
    if (!personnelComparisonData.length) return [];
    
    // Find max values for normalization
    const maxRevenue = Math.max(...personnelComparisonData.map(p => p.ciro));
    const maxOperations = Math.max(...personnelComparisonData.map(p => p.islemSayisi));
    const maxCommission = Math.max(...personnelComparisonData.map(p => p.prim));
    const maxNet = Math.max(...personnelComparisonData.map(p => p.net));
    const maxAvgRevenue = Math.max(...personnelComparisonData.map(p => p.ortalamaCiro));
    
    // Scale everything to 0-100 range for the radar chart
    return personnelComparisonData.map(p => ({
      subject: p.name,
      ciro: maxRevenue > 0 ? (p.ciro / maxRevenue) * 100 : 0,
      islemSayisi: maxOperations > 0 ? (p.islemSayisi / maxOperations) * 100 : 0,
      prim: maxCommission > 0 ? (p.prim / maxCommission) * 100 : 0,
      net: maxNet > 0 ? (p.net / maxNet) * 100 : 0,
      ortalamaCiro: maxAvgRevenue > 0 ? (p.ortalamaCiro / maxAvgRevenue) * 100 : 0,
    }));
  };
  
  const radarData = [
    { name: "Ciro", fullMark: 100 },
    { name: "İşlem Sayısı", fullMark: 100 },
    { name: "Prim", fullMark: 100 },
    { name: "Net", fullMark: 100 },
    { name: "Ortalama Ciro", fullMark: 100 },
  ];
  
  const radarChartData = generateRadarData();

  // Smart analysis for personnel comparison
  const generateSmartAnalysis = () => {
    if (!personnelComparisonData.length) {
      return ["Seçili tarih aralığında veya personel seçiminde yeterli veri bulunmamaktadır."];
    }
    
    const insights: string[] = [];
    
    // Best performer by revenue
    const bestRevenue = [...personnelComparisonData].sort((a, b) => b.ciro - a.ciro)[0];
    if (bestRevenue) {
      insights.push(`En yüksek ciroyu ${bestRevenue.name} elde etti (${formatCurrency(bestRevenue.ciro)}).`);
    }
    
    // Best performer by number of operations
    const bestOperations = [...personnelComparisonData].sort((a, b) => b.islemSayisi - a.islemSayisi)[0];
    if (bestOperations) {
      insights.push(`En çok işlemi ${bestOperations.name} gerçekleştirdi (${bestOperations.islemSayisi} işlem).`);
    }
    
    // Best performer by average revenue per operation
    const bestAvg = [...personnelComparisonData]
      .filter(p => p.islemSayisi > 0)
      .sort((a, b) => b.ortalamaCiro - a.ortalamaCiro)[0];
    if (bestAvg) {
      insights.push(`İşlem başına en yüksek geliri ${bestAvg.name} sağladı (ortalama ${formatCurrency(bestAvg.ortalamaCiro)}).`);
    }
    
    // Net revenue analysis
    const bestNet = [...personnelComparisonData].sort((a, b) => b.net - a.net)[0];
    if (bestNet) {
      insights.push(`En yüksek net geliri ${bestNet.name} sağladı (${formatCurrency(bestNet.net)}).`);
    }
    
    // Compare commission rates
    const commissionPersonnel = personnelComparisonData.filter(p => p.prim > 0);
    if (commissionPersonnel.length > 0) {
      const highestCommission = commissionPersonnel.sort((a, b) => b.prim - a.prim)[0];
      insights.push(`En yüksek prim alan ${highestCommission.name} (${formatCurrency(highestCommission.prim)}).`);
    }
    
    return insights;
  };
  
  const smartAnalysis = generateSmartAnalysis();

  // Calculate service distribution
  const serviceData = filteredOperations.reduce((acc, op) => {
    const serviceId = op.islem?.islem_adi || 'Diğer';
    
    if (!acc[serviceId]) {
      acc[serviceId] = {
        name: serviceId,
        count: 0,
        revenue: 0,
        personnelBreakdown: {}
      };
    }
    
    acc[serviceId].count += 1;
    acc[serviceId].revenue += op.tutar || 0;
    
    // Track by personnel too
    const personnelName = personeller.find(p => p.id === op.personel_id)?.ad_soyad || 'Bilinmeyen';
    if (!acc[serviceId].personnelBreakdown[personnelName]) {
      acc[serviceId].personnelBreakdown[personnelName] = {
        count: 0,
        revenue: 0,
        prim: 0,
        net: 0
      };
    }
    
    const personnel = personeller.find(p => p.id === op.personel_id);
    const commissionRate = personnel ? personnel.prim_yuzdesi / 100 : 0;
    const isCommissionBased = personnel?.calisma_sistemi === "komisyon";
    
    acc[serviceId].personnelBreakdown[personnelName].count += 1;
    acc[serviceId].personnelBreakdown[personnelName].revenue += op.tutar || 0;
    
    // Calculate commission and net
    const commission = isCommissionBased ? (op.tutar || 0) * commissionRate : 0;
    acc[serviceId].personnelBreakdown[personnelName].prim += commission;
    acc[serviceId].personnelBreakdown[personnelName].net += (op.tutar || 0) - commission;
    
    return acc;
  }, {} as Record<string, {
    name: string,
    count: number,
    revenue: number,
    personnelBreakdown: Record<string, {
      count: number,
      revenue: number,
      prim: number,
      net: number
    }>
  }>);
  
  const serviceAnalysisData = Object.values(serviceData).sort((a, b) => b.revenue - a.revenue);
  
  // Generate smart analysis for service distribution
  const generateServiceAnalysis = () => {
    if (!serviceAnalysisData.length) {
      return ["Seçili tarih aralığında veya seçimde yeterli veri bulunmamaktadır."];
    }
    
    const insights: string[] = [];
    
    // Most popular service
    const mostPopular = [...serviceAnalysisData].sort((a, b) => b.count - a.count)[0];
    insights.push(`En çok tercih edilen hizmet: ${mostPopular.name} (${mostPopular.count} kez).`);
    
    // Most profitable service
    const mostProfitable = [...serviceAnalysisData].sort((a, b) => b.revenue - a.revenue)[0];
    insights.push(`En yüksek gelir getiren hizmet: ${mostProfitable.name} (${formatCurrency(mostProfitable.revenue)}).`);
    
    // Service with highest average revenue
    const serviceAvgs = serviceAnalysisData.map(s => ({
      name: s.name,
      avg: s.count > 0 ? s.revenue / s.count : 0
    }));
    
    const highestAvg = serviceAvgs.sort((a, b) => b.avg - a.avg)[0];
    insights.push(`İşlem başına en yüksek gelir: ${highestAvg.name} (ortalama ${formatCurrency(highestAvg.avg)}).`);
    
    return insights;
  };
  
  const serviceSmartAnalysis = generateServiceAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <DateControlBar 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <div className="flex flex-wrap gap-2">
          {personeller.map(p => (
            <Badge
              key={p.id}
              variant={selectedPersonnelIds.includes(p.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => togglePersonnel(p.id)}
            >
              {p.ad_soyad}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="comparison">
        <TabsList>
          <TabsTrigger value="comparison">Personel Karşılaştırma</TabsTrigger>
          <TabsTrigger value="services">Hizmet Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Akıllı Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOperations.length === 0 ? (
                <Alert>
                  <CircleAlert className="h-4 w-4" />
                  <AlertDescription>
                    Seçili tarih aralığında veri bulunamadı.
                  </AlertDescription>
                </Alert>
              ) : (
                <ul className="space-y-1">
                  {smartAnalysis.map((insight, index) => (
                    <li key={index} className="flex items-baseline gap-2">
                      <span className="text-purple-600">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Ciro, Prim ve Net Karşılaştırması</CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Bu grafik personellerin toplam ciro, prim ve net gelirlerini gösterir.</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {personnelComparisonData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Bu tarih aralığında veri bulunmamaktadır.</p>
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-x-auto">
                      <div className="min-w-[600px] h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={personnelComparisonData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₺${value}`} />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), ""]}
                              contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                            />
                            <Legend />
                            <Bar dataKey="ciro" name="Ciro" fill="#8884d8" />
                            <Bar dataKey="prim" name="Prim" fill="#ffc658" />
                            <Bar dataKey="net" name="Net" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Performans Radar Grafiği</CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Bu grafik personellerin farklı performans metriklerini gösterir. Her metrik 100 üzerinden normalize edilmiştir.</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {radarChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Bu tarih aralığında veri bulunmamaktadır.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        {radarChartData.map((entry, index) => (
                          <Radar
                            key={entry.subject}
                            name={entry.subject}
                            dataKey={entry.subject}
                            stroke={`hsl(${index * 40}, 70%, 50%)`}
                            fill={`hsl(${index * 40}, 70%, 50%)`}
                            fillOpacity={0.6}
                            data={[
                              { name: "Ciro", [entry.subject]: entry.ciro },
                              { name: "İşlem Sayısı", [entry.subject]: entry.islemSayisi },
                              { name: "Prim", [entry.subject]: entry.prim },
                              { name: "Net", [entry.subject]: entry.net },
                              { name: "Ortalama Ciro", [entry.subject]: entry.ortalamaCiro }
                            ]}
                          />
                        ))}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle>Performans Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2">Personel</th>
                      <th className="text-right p-2">İşlem Sayısı</th>
                      <th className="text-right p-2">Toplam Ciro</th>
                      <th className="text-right p-2">Prim</th>
                      <th className="text-right p-2">Net</th>
                      <th className="text-right p-2">Ortalama İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelComparisonData.map((p, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{p.name}</td>
                        <td className="text-right p-2">{p.islemSayisi}</td>
                        <td className="text-right p-2">{formatCurrency(p.ciro)}</td>
                        <td className="text-right p-2">{formatCurrency(p.prim)}</td>
                        <td className="text-right p-2">{formatCurrency(p.net)}</td>
                        <td className="text-right p-2">
                          {p.islemSayisi > 0 ? formatCurrency(p.ciro / p.islemSayisi) : "-"}
                        </td>
                      </tr>
                    ))}
                    {personnelComparisonData.length > 0 && (
                      <tr className="border-t font-medium">
                        <td className="p-2">Toplam</td>
                        <td className="text-right p-2">
                          {personnelComparisonData.reduce((sum, p) => sum + p.islemSayisi, 0)}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(personnelComparisonData.reduce((sum, p) => sum + p.ciro, 0))}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(personnelComparisonData.reduce((sum, p) => sum + p.prim, 0))}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(personnelComparisonData.reduce((sum, p) => sum + p.net, 0))}
                        </td>
                        <td className="text-right p-2">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Akıllı Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceAnalysisData.length === 0 ? (
                <Alert>
                  <CircleAlert className="h-4 w-4" />
                  <AlertDescription>
                    Seçili tarih aralığında veri bulunamadı.
                  </AlertDescription>
                </Alert>
              ) : (
                <ul className="space-y-1">
                  {serviceSmartAnalysis.map((insight, index) => (
                    <li key={index} className="flex items-baseline gap-2">
                      <span className="text-purple-600">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle>Hizmet Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2">Hizmet</th>
                      <th className="text-right p-2">İşlem Sayısı</th>
                      <th className="text-right p-2">Toplam Tutar</th>
                      <th className="text-right p-2">Prim</th>
                      <th className="text-right p-2">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceAnalysisData.map((service, index) => {
                      // Calculate total prim and net across all personnel for this service
                      const totalPrim = Object.values(service.personnelBreakdown)
                        .reduce((sum, p) => sum + p.prim, 0);
                      
                      const totalNet = Object.values(service.personnelBreakdown)
                        .reduce((sum, p) => sum + p.net, 0);

                      return (
                        <tr key={index} className="border-t">
                          <td className="p-2">{service.name}</td>
                          <td className="text-right p-2">{service.count}</td>
                          <td className="text-right p-2">{formatCurrency(service.revenue)}</td>
                          <td className="text-right p-2">{formatCurrency(totalPrim)}</td>
                          <td className="text-right p-2">{formatCurrency(totalNet)}</td>
                        </tr>
                      );
                    })}
                    {serviceAnalysisData.length > 0 && (
                      <tr className="border-t font-medium">
                        <td className="p-2">Toplam</td>
                        <td className="text-right p-2">
                          {serviceAnalysisData.reduce((sum, s) => sum + s.count, 0)}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(serviceAnalysisData.reduce((sum, s) => sum + s.revenue, 0))}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(serviceAnalysisData.reduce((sum, s) => 
                            sum + Object.values(s.personnelBreakdown).reduce((prim, p) => prim + p.prim, 0), 0))}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(serviceAnalysisData.reduce((sum, s) => 
                            sum + Object.values(s.personnelBreakdown).reduce((net, p) => net + p.net, 0), 0))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Hizmet Dağılımı (Personel Bazlı)</h3>
                {serviceAnalysisData.map((service, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="font-medium text-sm mb-2">{service.name}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-2">Personel</th>
                            <th className="text-right p-2">İşlem Sayısı</th>
                            <th className="text-right p-2">Tutar</th>
                            <th className="text-right p-2">Prim</th>
                            <th className="text-right p-2">Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(service.personnelBreakdown).map(([name, stats], i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{name}</td>
                              <td className="text-right p-2">{stats.count}</td>
                              <td className="text-right p-2">{formatCurrency(stats.revenue)}</td>
                              <td className="text-right p-2">{formatCurrency(stats.prim)}</td>
                              <td className="text-right p-2">{formatCurrency(stats.net)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
