
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Coins, TrendingDown } from "@/components/ui/custom-icons";

const CHART_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", 
  "#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0"
];

interface ServiceData {
  name: string;
  revenue: number;
  materialCost: number;
  laborCost: number;
  fixedCost: number;
  totalCost?: number;
  profit?: number;
  profitMargin?: number;
}

interface CategoryData {
  name: string;
  revenue: number;
  cost: number;
  count: number;
  profit?: number;
  profitMargin?: number;
}

interface PeriodData {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  change?: number;
}

interface ProfitAnalysisProps {
  operations: any[];
  fixedExpenses: number;
  monthlyAppointments: number;
}

export function ProfitAnalysis({ operations, fixedExpenses, monthlyAppointments }: ProfitAnalysisProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [expenseView, setExpenseView] = useState<'service' | 'category'>('service');
  
  // Servis bazlı kâr analizi verileri
  const serviceAnalysisData = operations.reduce((acc: Record<string, ServiceData>, op) => {
    if (!op.islem) return acc;
    
    const serviceName = op.islem.islem_adi;
    if (!serviceName) return acc;
    
    if (!acc[serviceName]) {
      acc[serviceName] = {
        name: serviceName,
        revenue: 0,
        materialCost: 0,
        laborCost: 0,
        fixedCost: 0
      };
    }
    
    // Gelir
    acc[serviceName].revenue += (op.tutar || 0);
    
    // Malzeme maliyeti (hizmet içindeki maliyet alanından)
    acc[serviceName].materialCost += ((op.islem.maliyet || 0) * (op.miktar || 1));
    
    // İşçilik maliyeti (personele ödenen)
    acc[serviceName].laborCost += (op.odenen || 0);
    
    // Sabit gider dağılımı (her işleme eşit dağıtılır)
    const fixedCostPerAppointment = monthlyAppointments > 0 ? fixedExpenses / monthlyAppointments : 0;
    acc[serviceName].fixedCost += fixedCostPerAppointment;
    
    return acc;
  }, {});
  
  // Veriyi diziye dönüştür
  const serviceData = Object.values(serviceAnalysisData).map((service: ServiceData) => {
    const totalCost = service.materialCost + service.laborCost + service.fixedCost;
    const profit = service.revenue - totalCost;
    const profitMargin = service.revenue > 0 ? (profit / service.revenue) * 100 : 0;
    
    return {
      ...service,
      totalCost,
      profit,
      profitMargin
    };
  }).sort((a, b) => b.profit - a.profit);
  
  // En kârlı ve en az kârlı hizmetler
  const mostProfitableService = serviceData.length > 0 ? serviceData[0] : null;
  const leastProfitableService = serviceData.length > 0 ? serviceData[serviceData.length - 1] : null;
  
  // Kategori bazlı kâr analizi
  const categoryAnalysisData = operations.reduce((acc: Record<string, CategoryData>, op) => {
    if (!op.islem || !op.islem.kategori_id) return acc;
    
    // Kategori bilgisi
    const categoryName = op.islem.kategori_adi || "Kategorisiz";
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        revenue: 0,
        cost: 0,
        count: 0
      };
    }
    
    acc[categoryName].revenue += (op.tutar || 0);
    acc[categoryName].cost += ((op.islem.maliyet || 0) * (op.miktar || 1)) + (op.odenen || 0);
    acc[categoryName].count += 1;
    
    return acc;
  }, {});
  
  const categoryData = Object.values(categoryAnalysisData).map((category: CategoryData) => {
    const profit = category.revenue - category.cost;
    const profitMargin = category.revenue > 0 ? (profit / category.revenue) * 100 : 0;
    
    return {
      ...category,
      profit,
      profitMargin
    };
  }).sort((a, b) => b.profit - a.profit);
  
  // Dönemsel kârlılık verileri (simüle edilmiş)
  const generatePeriodData = () => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const weeks = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    let labels: string[];
    let dataCount: number;
    
    switch(period) {
      case 'weekly':
        labels = weeks;
        dataCount = 4;
        break;
      case 'yearly':
        labels = quarters;
        dataCount = 4;
        break;
      case 'monthly':
      default:
        labels = months.slice(0, 6);  // Son 6 ay
        dataCount = 6;
        break;
    }
    
    const baseRevenue = 10000;
    const baseCost = 6000;
    const data: PeriodData[] = [];
    
    let prevProfit = 0;
    
    for (let i = 0; i < dataCount; i++) {
      // Gerçek veriler yerine simüle edilmiş değerler
      const randomFactor = 0.9 + Math.random() * 0.3;  // 0.9 - 1.2 arası
      const revenue = baseRevenue * randomFactor;
      const cost = baseCost * (0.95 + Math.random() * 0.1);  // 0.95 - 1.05 arası
      const profit = revenue - cost;
      
      let change = 0;
      if (prevProfit > 0) {
        change = ((profit - prevProfit) / prevProfit) * 100;
      }
      prevProfit = profit;
      
      data.push({
        name: labels[i],
        revenue,
        cost,
        profit,
        change
      });
    }
    
    return data;
  };
  
  const periodData = generatePeriodData();
  
  // Kârlılık renk skalası
  const getProfitColor = (profitPercent: number) => {
    if (profitPercent < 0) return "text-red-600 bg-red-50";
    if (profitPercent <= 10) return "text-red-500 bg-red-50";
    if (profitPercent <= 20) return "text-orange-500 bg-orange-50";
    if (profitPercent <= 30) return "text-amber-500 bg-amber-50";
    if (profitPercent <= 40) return "text-yellow-500 bg-yellow-50";
    if (profitPercent <= 50) return "text-lime-500 bg-lime-50";
    return "text-green-600 bg-green-50";
  };
  
  // Para formatı
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Grafik için tooltip formatı
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-md">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-sm text-gray-600">Gelir: {formatCurrency(data.revenue)}</p>
          <p className="text-sm text-gray-600">Gider: {formatCurrency(data.cost || data.totalCost)}</p>
          <p className="text-sm font-medium">
            Kâr: {formatCurrency(data.profit)} 
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${getProfitColor(data.profitMargin)}`}>
              %{data.profitMargin.toFixed(1)}
            </span>
          </p>
          {data.change !== undefined && (
            <p className="text-sm mt-1">
              <span className={data.change >= 0 ? "text-green-600" : "text-red-600"}>
                {data.change >= 0 ? "+" : ""}{data.change.toFixed(1)}%
              </span>
              <span className="text-gray-600 ml-1">
                {data.change >= 0 ? "artış" : "azalış"}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Kârlılık Analizi</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(val: 'weekly' | 'monthly' | 'yearly') => setPeriod(val)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Dönem Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={expenseView} onValueChange={(val: 'service' | 'category') => setExpenseView(val)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Görünüm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">Hizmet Bazlı</SelectItem>
              <SelectItem value="category">Kategori Bazlı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mostProfitableService && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>En Kârlı Hizmet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-1">{mostProfitableService.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Net Kâr:</span>
                <Badge className={`${getProfitColor(mostProfitableService.profitMargin)} text-sm`}>
                  {formatCurrency(mostProfitableService.profit)} (%{mostProfitableService.profitMargin.toFixed(1)})
                </Badge>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Gelir:</span>
                  <span>{formatCurrency(mostProfitableService.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gider:</span>
                  <span>{formatCurrency(mostProfitableService.totalCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {leastProfitableService && leastProfitableService.profit < 0 && (
          <Card className="bg-red-50 border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span>Zarar Eden Hizmet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-1">{leastProfitableService.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Net Zarar:</span>
                <Badge variant="destructive" className="text-sm">
                  {formatCurrency(leastProfitableService.profit)}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Gelir:</span>
                  <span>{formatCurrency(leastProfitableService.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gider:</span>
                  <span>{formatCurrency(leastProfitableService.totalCost)}</span>
                </div>
              </div>
              
              <Alert className="mt-3 bg-red-50 border-red-200">
                <AlertDescription className="text-xs">
                  Bu hizmetin maliyetleri ve fiyatlandırması gözden geçirilmelidir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-500" />
              <span>Genel Görünüm</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-1">Dönemsel Kâr</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Son Dönem:</span>
              {periodData.length > 0 && (
                <Badge className={`${periodData[periodData.length-1].profit > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-sm`}>
                  {formatCurrency(periodData[periodData.length-1].profit)}
                </Badge>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Ortalama Kârlılık:</span>
                <span>
                  %{(serviceData.reduce((sum, service) => sum + service.profitMargin, 0) / (serviceData.length || 1)).toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>
              {expenseView === 'service' ? 'Hizmetlerin Kârlılık Analizi' : 'Kategori Bazlı Kârlılık'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseView === 'service' ? serviceData.slice(0, 10) : categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    height={80} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Bar dataKey="revenue" name="Gelir" fill="#4CAF50" />
                  <Bar dataKey={expenseView === 'service' ? "totalCost" : "cost"} name="Gider" fill="#F44336" />
                  <Bar dataKey="profit" name="Net Kâr" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>Dönemsel Kârlılık Takibi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={periodData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Bar dataKey="revenue" name="Gelir" fill="#4CAF50" />
                  <Bar dataKey="cost" name="Gider" fill="#F44336" />
                  <Bar dataKey="profit" name="Net Kâr" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gider Kalemlerinin Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Grafik</TabsTrigger>
              <TabsTrigger value="table">Tablo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Malzeme Gideri', value: serviceData.reduce((sum, s) => sum + s.materialCost, 0) },
                      { name: 'Personel Gideri', value: serviceData.reduce((sum, s) => sum + s.laborCost, 0) },
                      { name: 'Sabit Giderler', value: serviceData.reduce((sum, s) => sum + s.fixedCost, 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => `${name}: %${(percent * 100).toFixed(0)}`}
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="table">
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Gider Kalemi</th>
                      <th className="text-right p-3">Tutar</th>
                      <th className="text-right p-3">Oran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const materialCost = serviceData.reduce((sum, s) => sum + s.materialCost, 0);
                      const laborCost = serviceData.reduce((sum, s) => sum + s.laborCost, 0);
                      const fixedCost = serviceData.reduce((sum, s) => sum + s.fixedCost, 0);
                      const totalCost = materialCost + laborCost + fixedCost;
                      
                      return [
                        { name: 'Malzeme Gideri', value: materialCost },
                        { name: 'Personel Gideri', value: laborCost },
                        { name: 'Sabit Giderler', value: fixedCost },
                        { name: 'TOPLAM', value: totalCost, isTotal: true }
                      ].map((item, idx) => (
                        <tr key={idx} className={item.isTotal ? "font-bold bg-gray-50" : "border-b"}>
                          <td className="p-3">{item.name}</td>
                          <td className="text-right p-3">{formatCurrency(item.value)}</td>
                          <td className="text-right p-3">
                            {item.isTotal ? '' : `%${((item.value / totalCost) * 100).toFixed(1)}`}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
