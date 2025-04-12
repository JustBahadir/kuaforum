
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DailyView } from "./components/DailyView";
import { WeeklyView } from "./components/WeeklyView";
import { MonthlyView } from "./components/MonthlyView";
import { YearlyView } from "./components/YearlyView";
import { PersonnelPerformance } from "./components/PersonnelPerformance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths, setDate } from "date-fns";
import { personelIslemleriServisi, personelServisi, islemServisi, islemKategoriServisi } from "@/lib/supabase";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { AnalystBox } from "@/components/analyst/AnalystBox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { RevenueSourceChart } from "./components/RevenueSourceChart";
import { CategoryDistributionChart } from "./components/CategoryDistributionChart";

// Define type for service data
interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

// Define type for category data
interface CategoryData {
  name: string;
  value: number;
  count: number;
  percentage?: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
];

export default function ShopStatistics() {
  const { dukkanId, userRole } = useCustomerAuth();
  const [activeView, setActiveView] = useState("monthly");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);

  // Fetch personnel data
  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ["personnel-stats"],
    queryFn: personelServisi.hepsiniGetir,
  });

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

  // Fetch operations data based on date range
  const { data: operations = [], isLoading: operationsLoading } = useQuery({
    queryKey: ["operations-stats", dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        const data = await personelIslemleriServisi.hepsiniGetir();
        return data.filter((op) => {
          if (!op.created_at) return false;
          const date = new Date(op.created_at);
          return date >= dateRange.from && date <= dateRange.to;
        });
      } catch (error) {
        console.error("Failed to fetch operations data:", error);
        return [];
      }
    },
  });

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services-stats"],
    queryFn: () => islemServisi.hepsiniGetir(),
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-stats"],
    queryFn: () => islemKategoriServisi.hepsiniGetir(),
  });

  // Calculate service data
  const serviceData = useState(() => {
    if (!operations.length) return [];

    const serviceMap = new Map<string, ServiceDataItem>();
    let totalRevenue = 0;

    operations.forEach((op) => {
      const serviceName = op.islem?.islem_adi || op.aciklama || "Diğer";

      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, {
          name: serviceName,
          count: 0,
          revenue: 0,
        });
      }

      const entry = serviceMap.get(serviceName)!;
      entry.count += 1;
      entry.revenue += op.tutar || 0;

      totalRevenue += op.tutar || 0;
    });

    // Sort by revenue and calculate percentages
    const result = Array.from(serviceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((item) => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
      }));

    return result;
  })[0];

  // Calculate category data
  const categoryData: CategoryData[] = useState(() => {
    if (!operations.length) return [];

    const categoryMap = new Map<string, CategoryData>();
    let totalRevenue = 0;

    operations.forEach((op) => {
      const categoryName = op.islem?.kategori?.kategori_adi || "Diğer";

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          value: 0,
          count: 0,
        });
      }

      const entry = categoryMap.get(categoryName)!;
      entry.value += op.tutar || 0;
      entry.count += 1;

      totalRevenue += op.tutar || 0;
    });

    // Calculate percentages
    const result = Array.from(categoryMap.values()).map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0,
    }));

    return result;
  })[0];

  // Common statistics
  const stats = useState(() => {
    if (!operations.length)
      return { totalRevenue: 0, totalOperations: 0, averageRevenue: 0 };

    const totalOperations = operations.length;
    const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
    const averageRevenue = totalRevenue / totalOperations;

    return { totalRevenue, totalOperations, averageRevenue };
  })[0];

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      setIsInsightsLoading(true);

      try {
        if (operations.length === 0) {
          setInsights([]);
          setIsInsightsLoading(false);
          return;
        }

        const insights = [];

        // Top service by revenue
        if (serviceData.length > 0) {
          const topService = serviceData[0];
          insights.push(
            `En çok kazandıran hizmet: ${formatCurrency(
              topService.revenue
            )} ile ${topService.name}.`
          );
        }

        // Top service by count
        const sortedByCount = [...serviceData].sort((a, b) => b.count - a.count);
        if (sortedByCount.length > 0) {
          insights.push(
            `En çok tercih edilen hizmet: ${sortedByCount[0].count} işlem ile ${sortedByCount[0].name}.`
          );
        }

        // Busiest day
        const dayMap = new Map<string, number>();
        operations.forEach((op) => {
          if (!op.created_at) return;
          const date = new Date(op.created_at);
          const day = date.toLocaleDateString("tr-TR", { weekday: "long" });

          dayMap.set(day, (dayMap.get(day) || 0) + 1);
        });

        if (dayMap.size > 0) {
          const entries = Array.from(dayMap.entries());
          const busiestDay = entries.reduce((a, b) =>
            a[1] > b[1] ? a : b
          );
          insights.push(`En yoğun gün: ${busiestDay[1]} işlem ile ${busiestDay[0]}.`);
        }

        // Most productive personnel
        const personnelMap = new Map<string, { count: number; revenue: number }>();
        operations.forEach((op) => {
          if (!op.personel_id) return;
          const person = personnel.find((p) => p.id === op.personel_id);
          if (!person) return;

          const name = person.ad_soyad;
          if (!personnelMap.has(name)) {
            personnelMap.set(name, { count: 0, revenue: 0 });
          }

          const entry = personnelMap.get(name)!;
          entry.count += 1;
          entry.revenue += op.tutar || 0;
        });

        if (personnelMap.size > 0) {
          const entries = Array.from(personnelMap.entries());
          const topByRevenue = entries.sort(
            (a, b) => b[1].revenue - a[1].revenue
          )[0];
          const topByCount = entries.sort(
            (a, b) => b[1].count - a[1].count
          )[0];

          if (topByRevenue) {
            insights.push(
              `En çok ciro yapan: ${formatCurrency(
                topByRevenue[1].revenue
              )} ile ${topByRevenue[0]}.`
            );
          }

          if (
            topByCount &&
            topByCount[0] !== topByRevenue[0] &&
            insights.length < 4
          ) {
            insights.push(
              `En çok işlem yapan: ${topByCount[1].count} işlem ile ${topByCount[0]}.`
            );
          }
        }

        // Least popular service
        if (sortedByCount.length > 2 && insights.length < 4) {
          const leastPopular =
            sortedByCount[sortedByCount.length - 1];
          insights.push(
            `En az tercih edilen hizmet: ${leastPopular.count} işlem ile ${leastPopular.name}.`
          );
        }

        setInsights(insights.slice(0, 4));
      } catch (error) {
        console.error("Error generating insights:", error);
        setInsights(["Veri analizi sırasında bir hata oluştu."]);
      } finally {
        setIsInsightsLoading(false);
      }
    };

    if (!operationsLoading && !servicesLoading && !categoriesLoading) {
      generateInsights();
    }
  }, [operations, serviceData, personnel, operationsLoading, servicesLoading, categoriesLoading]);

  // Handle refresh of insights
  const handleRefreshInsights = () => {
    setIsInsightsLoading(true);
    setTimeout(() => {
      // Re-generate insights with some randomization for variety
      const currentInsights = [...insights];
      const shuffled = currentInsights.sort(() => 0.5 - Math.random());
      setInsights(shuffled);
      setIsInsightsLoading(false);
    }, 600);
  };

  const isLoading =
    operationsLoading || servicesLoading || personnelLoading || categoriesLoading;
  const hasEnoughData = operations.length > 0;

  if (userRole !== "admin") {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca yöneticiler
            dükkan istatistiklerini görüntüleyebilir.
          </AlertDescription>
        </Alert>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dükkan İstatistikleri</h1>

        {/* AI analyst section */}
        <AnalystBox
          title=""
          insights={insights}
          isLoading={isInsightsLoading}
          onRefresh={handleRefreshInsights}
          hasEnoughData={hasEnoughData}
          className="mb-6"
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Select value={activeView} onValueChange={setActiveView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Görünüm seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
              <SelectItem value="custom">Özel Tarih</SelectItem>
            </SelectContent>
          </Select>

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

        {/* Basic stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Toplam İşlem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOperations}</div>
              <p className="text-sm text-muted-foreground">
                Seçili tarih aralığında
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Toplam Ciro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">
                Seçili tarih aralığında
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Ortalama İşlem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.averageRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">İşlem başına</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab content */}
        <Tabs
          value={activeView}
          onValueChange={setActiveView}
          className="space-y-8"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Günlük</TabsTrigger>
            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
            <TabsTrigger value="yearly">Yıllık</TabsTrigger>
            <TabsTrigger value="custom">Özel Tarih</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <DailyView dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <WeeklyView dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <MonthlyView dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <YearlyView />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Performance data */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Performans Verileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Revenue by service chart */}
                      <div>
                        <h3 className="text-sm font-medium mb-1">
                          Hizmet Bazlı Gelir Dağılımı
                        </h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={serviceData}
                                dataKey="revenue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                              >
                                {serviceData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) =>
                                  formatCurrency(value)
                                }
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Category distribution chart */}
                      <div>
                        <h3 className="text-sm font-medium mb-1">
                          Kategori Dağılımı
                        </h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) =>
                                  formatCurrency(value)
                                }
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Category distribution and revenue source charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <CategoryDistributionChart data={categoryData.map(item => ({
                    name: item.name,
                    value: item.value,
                    count: item.count,
                    percentage: item.percentage || 0
                  }))} isLoading={isLoading} />
                  <RevenueSourceChart data={serviceData} isLoading={isLoading} />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
