import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

interface PersonelIslemi {
  id: number;
  personel_id: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  // other fields...
}

interface Personel {
  id: number;
  ad_soyad: string;
  // other fields...
}

interface PerformanceChartsProps {
  personeller: Personel[];
  islemGecmisi: PersonelIslemi[];
}

interface PersonelPerformanceData {
  name: string;
  id: number;
  totalRevenue: number;
  totalCount: number;
  totalCommission: number;
  averageRevenue: number;
}

interface TimeFilterOption {
  label: string;
  value: string;
  days: number;
}

const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  { label: "Son 7 Gün", value: "7days", days: 7 },
  { label: "Son 30 Gün", value: "30days", days: 30 },
  { label: "Son 90 Gün", value: "90days", days: 90 },
  { label: "Tüm Zaman", value: "all", days: 0 }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const [timeFilter, setTimeFilter] = useState<string>("30days");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedTab, setSelectedTab] = useState("revenue");

  const filteredOperations = islemGecmisi.filter(islem => {
    if (!islem.created_at) return false;
    
    const date = new Date(islem.created_at);
    return date >= dateRange.from && date <= dateRange.to;
  });

  const personnelPerformance = personeller.map(personel => {
    const personelIslemleri = filteredOperations.filter(islem => islem.personel_id === personel.id);
    
    const totalRevenue = personelIslemleri.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
    const totalCount = personelIslemleri.length;
    const totalCommission = personelIslemleri.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
    
    return {
      name: personel.ad_soyad,
      id: personel.id,
      totalRevenue,
      totalCount,
      totalCommission,
      averageRevenue: totalCount > 0 ? totalRevenue / totalCount : 0
    };
  }).filter(p => p.totalCount > 0);

  const getSortedData = (data: PersonelPerformanceData[], metric: string) => {
    return [...data].sort((a, b) => {
      if (metric === "count") return b.totalCount - a.totalCount;
      if (metric === "commission") return b.totalCommission - a.totalCommission;
      return b.totalRevenue - a.totalRevenue;
    });
  };

  const sortedByRevenue = getSortedData(personnelPerformance, "revenue");
  const sortedByCount = getSortedData(personnelPerformance, "count");
  const sortedByCommission = getSortedData(personnelPerformance, "commission");

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    
    if (value === "all") {
      setDateRange({
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
        to: new Date()
      });
      return;
    }
    
    const option = TIME_FILTER_OPTIONS.find(opt => opt.value === value);
    if (option) {
      setDateRange({
        from: new Date(new Date().setDate(new Date().getDate() - option.days)),
        to: new Date()
      });
    }
  };

  const generateInsights = () => {
    if (personnelPerformance.length === 0) {
      return ["Henüz yeterli veri bulunmamaktadır."];
    }

    const insights = [];
    
    if (sortedByCount.length > 0) {
      insights.push(`${sortedByCount[0].name} bu dönemde ${sortedByCount[0].totalCount} işlemle en çok işlem yapan personel oldu.`);
    }
    
    if (sortedByRevenue.length > 0) {
      insights.push(`${sortedByRevenue[0].name} toplam ${formatCurrency(sortedByRevenue[0].totalRevenue)} ciro ile lider durumda.`);
    }
    
    if (sortedByRevenue.length > 1) {
      const topRevenue = sortedByRevenue[0].totalRevenue;
      const avgRevenue = personnelPerformance.reduce((sum, p) => sum + p.totalRevenue, 0) / personnelPerformance.length;
      
      const percentage = Math.round((topRevenue - avgRevenue) / avgRevenue * 100);
      
      if (percentage > 0) {
        insights.push(`${sortedByRevenue[0].name}, ortalamadan %${percentage} daha fazla ciro yapıyor.`);
      }
    }
    
    if (sortedByCount.length > 0 && filteredOperations.length > 0) {
      const topOperationsCount = sortedByCount[0].totalCount;
      const totalOperationsCount = filteredOperations.length;
      
      const percentage = Math.round(topOperationsCount / totalOperationsCount * 100);
      
      insights.push(`Her ${Math.round(100 / percentage)} işlemden ${percentage > 50 ? `${Math.round(percentage/10)*10}'ı` : "1'i"} ${sortedByCount[0].name} tarafından yapılmış.`);
    }
    
    return insights;
  };

  const insights = generateInsights();
  const hasData = personnelPerformance.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Zaman Filtresi" />
          </SelectTrigger>
          <SelectContent>
            {TIME_FILTER_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onSelect={({from, to}) => setDateRange({from, to})}
        />
      </div>

      {!hasData ? (
        <Alert>
          <CircleAlert className="h-4 w-4" />
          <AlertDescription>
            Seçilen zaman aralığında personel performans verisi bulunmamaktadır.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle>Personel Performans Karşılaştırması</CardTitle>
                  <TabsList>
                    <TabsTrigger value="revenue">Ciro</TabsTrigger>
                    <TabsTrigger value="count">İşlem Sayısı</TabsTrigger>
                    <TabsTrigger value="commission">Prim</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={
                        selectedTab === "revenue" ? sortedByRevenue :
                        selectedTab === "count" ? sortedByCount : 
                        sortedByCommission
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        tickFormatter={
                          selectedTab === "count" ? 
                            (value) => `${value}` : 
                            (value) => formatCurrency(value)
                        }
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={
                          (value: any, name: any) => {
                            if (selectedTab === "count") return [`${value} adet`, "İşlem Sayısı"];
                            return [formatCurrency(value as number), selectedTab === "revenue" ? "Ciro" : "Prim"];
                          }
                        }
                      />
                      <Legend />
                      <Bar 
                        dataKey={
                          selectedTab === "revenue" ? "totalRevenue" : 
                          selectedTab === "count" ? "totalCount" : 
                          "totalCommission"
                        }
                        name={
                          selectedTab === "revenue" ? "Ciro" : 
                          selectedTab === "count" ? "İşlem Sayısı" : 
                          "Prim"
                        }
                        fill="#8884d8"
                      >
                        {personnelPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Akıllı Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="text-purple-600 text-lg">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
