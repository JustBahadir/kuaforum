
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatCurrency } from "@/lib/utils";
import { personelIslemleriServisi, personelServisi, islemServisi, kategoriServisi } from "@/lib/supabase";

import { CategoryDistributionChart } from "./components/CategoryDistributionChart";
import { RevenueSourceChart } from "./components/RevenueSourceChart";
import { ServiceDistributionChart } from "./components/ServiceDistributionChart";
import { OperationDistributionChart } from "./components/OperationDistributionChart";

import { AnalystBox } from "@/components/analyst/AnalystBox";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
  percentage?: number;
}

export default function ShopStatistics() {
  const { userRole } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<"category" | "service">("category");

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);

  const [insights, setInsights] = useState<string[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);

  // Data fetching for personnel, operations, services, categories
  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ["personnel-stats"],
    queryFn: personelServisi.hepsiniGetir,
  });

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

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services-stats"],
    queryFn: () => islemServisi.hepsiniGetir(),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-stats"],
    queryFn: () => kategoriServisi.hepsiniGetir(),
  });

  const isLoading =
    operationsLoading || servicesLoading || personnelLoading || categoriesLoading;

  // Build service data summary
  const serviceData = (() => {
    if (!operations.length) return [];

    const serviceMap = new Map<string, ServiceDataItem>();
    let totalRevenue = 0;

    operations.forEach((op) => {
      const serviceName = op.islem?.islem_adi || op.aciklama || "Diğer";
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { name: serviceName, count: 0, revenue: 0 });
      }
      const entry = serviceMap.get(serviceName)!;
      entry.count += 1;
      entry.revenue += op.tutar || 0;
      totalRevenue += op.tutar || 0;
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((item) => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
      }));
  })();

  // Build category data summary
  const categoryData = (() => {
    if (!operations.length) return [];

    const categoryMap = new Map<string, CategoryData>();
    let totalRevenue = 0;

    operations.forEach((op) => {
      const categoryId = op.islem?.kategori_id;
      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category ? category.kategori_adi : "Diğer";

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { name: categoryName, value: 0, count: 0 });
      }
      const entry = categoryMap.get(categoryName)!;
      entry.value += op.tutar || 0;
      entry.count += 1;
      totalRevenue += op.tutar || 0;
    });

    return Array.from(categoryMap.values()).map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0,
    }));
  })();

  // Statistics for upper cards
  const stats = (() => {
    if (!operations.length)
      return { totalRevenue: 0, totalOperations: 0, averageRevenue: 0 };

    const totalOperations = operations.length;
    const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
    const averageRevenue = totalRevenue / totalOperations;

    return { totalRevenue, totalOperations, averageRevenue };
  })();

  // Insight generation logic
  useEffect(() => {
    const generateInsights = () => {
      setIsInsightsLoading(true);

      try {
        if (operations.length === 0) {
          setInsights([]);
          setIsInsightsLoading(false);
          return;
        }

        const insightsArray: string[] = [];

        if (serviceData.length > 0) {
          const topService = serviceData[0];
          insightsArray.push(
            `En çok kazandıran hizmet: ${formatCurrency(topService.revenue)} ile ${topService.name}.`
          );
        }

        const sortedByCount = [...serviceData].sort((a, b) => b.count - a.count);
        if (sortedByCount.length > 0) {
          insightsArray.push(
            `En çok tercih edilen hizmet: ${sortedByCount[0].count} işlem ile ${sortedByCount[0].name}.`
          );
        }

        const dayMap = new Map<string, number>();
        operations.forEach((op) => {
          if (!op.created_at) return;
          const date = new Date(op.created_at);
          const day = date.toLocaleDateString("tr-TR", { weekday: "long" });

          dayMap.set(day, (dayMap.get(day) || 0) + 1);
        });

        if (dayMap.size > 0) {
          const entries = Array.from(dayMap.entries());
          const busiestDay = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
          insightsArray.push(`En yoğun gün: ${busiestDay[1]} işlem ile ${busiestDay[0]}.`);
        }

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
          const topByRevenue = entries.sort((a, b) => b[1].revenue - a[1].revenue)[0];
          const topByCount = entries.sort((a, b) => b[1].count - a[1].count)[0];

          if (topByRevenue) {
            insightsArray.push(
              `En çok ciro yapan: ${formatCurrency(topByRevenue[1].revenue)} ile ${topByRevenue[0]}.`
            );
          }

          if (topByCount && topByCount[0] !== topByRevenue[0] && insightsArray.length < 4) {
            insightsArray.push(
              `En çok işlem yapan: ${topByCount[1].count} işlem ile ${topByCount[0]}.`
            );
          }
        }

        if (sortedByCount.length > 2 && insightsArray.length < 4) {
          const leastPopular = sortedByCount[sortedByCount.length - 1];
          insightsArray.push(
            `En az tercih edilen hizmet: ${leastPopular.count} işlem ile ${leastPopular.name}.`
          );
        }

        setInsights(insightsArray.slice(0, 4));
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

  const handleDateRangeChange = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    setUseMonthCycle(false);
  };

  const handleMonthCycleChange = (day: number) => {
    setMonthCycleDay(day);

    const currentDate = new Date();
    let fromDate = new Date();
    fromDate.setDate(day);
    if (currentDate.getDate() < day) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);

    setDateRange({ from: fromDate, to: toDate });
    setUseMonthCycle(true);
  };

  const handleRefreshInsights = () => {
    setIsInsightsLoading(true);
    setTimeout(() => {
      const currentInsights = [...insights];
      const shuffled = currentInsights.sort(() => 0.5 - Math.random());
      setInsights(shuffled);
      setIsInsightsLoading(false);
    }, 600);
  };

  if (userRole !== "admin") {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca yöneticiler işletme
            istatistiklerini görüntüleyebilir.
          </AlertDescription>
        </Alert>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">İşletme İstatistikleri</h1>

        {/* Akıllı Analiz */}
        <AnalystBox
          title="Akıllı Analiz"
          insights={insights}
          isLoading={isInsightsLoading}
          onRefresh={handleRefreshInsights}
          hasEnoughData={operations.length > 0}
          className="mb-6"
        />

        {/* Tarih Seçimi */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rapor Seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Kategori İstatistikleri</SelectItem>
              <SelectItem value="service">Hizmet İstatistikleri</SelectItem>
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

        {/* Sekmeler */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="category"
          className="border rounded-md"
        >
          <TabsList className="bg-muted">
            <TabsTrigger
              value="category"
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === "category" ? "bg-background text-primary" : "text-muted-foreground"
              }`}
            >
              Kategori İstatistikleri
            </TabsTrigger>
            <TabsTrigger
              value="service"
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === "service" ? "bg-background text-primary" : "text-muted-foreground"
              }`}
            >
              Hizmet İstatistikleri
            </TabsTrigger>
          </TabsList>

          {/* Kategori İstatistikleri */}
          <TabsContent value="category" className="p-6 space-y-6">
            {/* Çizgi-Sütun Grafiği Kategori için gösterilmedi istenirse eklenebilir */}

            {/* Pie Chart ve Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Ciro Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 h-72">
                  <CategoryDistributionChart data={categoryData} isLoading={isLoading} />
                </div>
                <div className="w-full md:w-1/2 overflow-auto max-h-72">
                  {/* Renkli liste - legend */}
                  <ul className="divide-y border rounded-md overflow-auto max-h-72">
                    {categoryData.map((item, index) => (
                      <li
                        key={item.name}
                        className="flex items-center gap-4 px-4 py-2 cursor-default hover:bg-muted"
                      >
                        <span
                          className="inline-block w-4 h-4 rounded"
                          style={{
                            backgroundColor: `var(--color-${index})`,
                            background: undefined,
                          }}
                        />
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.percentage?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground min-w-[80px] text-right">
                          {item.count} işlem
                        </div>
                        <div className="ml-4 text-xs font-mono text-muted-foreground min-w-[100px] text-right">
                          {formatCurrency(item.value)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tablo */}
            <Card className="overflow-auto">
              <CardHeader>
                <CardTitle>Kategori Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full table-auto border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted text-muted-foreground">
                      <th className="border border-border px-4 py-2 text-left">Kategori</th>
                      <th className="border border-border px-4 py-2 text-right">İşlem Sayısı</th>
                      <th className="border border-border px-4 py-2 text-right">Toplam Ciro</th>
                      <th className="border border-border px-4 py-2 text-right">Yüzde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((cat) => (
                      <tr key={cat.name} className="border-b border-border hover:bg-muted">
                        <td className="border border-border px-4 py-2 font-semibold">{cat.name}</td>
                        <td className="border border-border px-4 py-2 text-right">{cat.count}</td>
                        <td className="border border-border px-4 py-2 text-right">
                          {formatCurrency(cat.value)}
                        </td>
                        <td className="border border-border px-4 py-2 text-right">
                          {cat.percentage?.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold bg-muted">
                      <td className="border border-border px-4 py-2">Toplam</td>
                      <td className="border border-border px-4 py-2 text-right">
                        {categoryData.reduce((acc, cur) => acc + cur.count, 0)}
                      </td>
                      <td className="border border-border px-4 py-2 text-right">
                        {formatCurrency(categoryData.reduce((acc, cur) => acc + cur.value, 0))}
                      </td>
                      <td className="border border-border px-4 py-2 text-right">
                        {categoryData.reduce((acc, cur) => acc + (cur.percentage || 0), 0).toFixed(2)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hizmet İstatistikleri */}
          <TabsContent value="service" className="p-6 space-y-6">
            {/* Çizgi-Sütun Grafiği Hizmet için */}
            <Card className="overflow-x-auto">
              <CardHeader>
                <CardTitle>Hizmet Performansı - Ciro & İşlem Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: `${serviceData.length * 100}px`, minWidth: "100%" }}>
                  <RevenueSourceChart data={serviceData} isLoading={isLoading} />
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart ve Legend Hizmet */}
            <Card>
              <CardHeader>
                <CardTitle>Ciro Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 h-72">
                  <ServiceDistributionChart data={serviceData} isLoading={isLoading} />
                </div>
                <div className="w-full md:w-1/2 overflow-auto max-h-72">
                  {/* Renkli liste - legend */}
                  <ul className="divide-y border rounded-md overflow-auto max-h-72">
                    {serviceData.map((item, index) => (
                      <li
                        key={item.name}
                        className="flex items-center gap-4 px-4 py-2 cursor-default hover:bg-muted"
                      >
                        <span
                          className="inline-block w-4 h-4 rounded"
                          style={{
                            backgroundColor: `var(--color-${index})`,
                            background: undefined,
                          }}
                        />
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.percentage?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground min-w-[80px] text-right">
                          {item.count} işlem
                        </div>
                        <div className="ml-4 text-xs font-mono text-muted-foreground min-w-[100px] text-right">
                          {formatCurrency(item.revenue)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tablo Hizmet */}
            <Card className="overflow-auto">
              <CardHeader>
                <CardTitle>Hizmet Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full table-auto border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted text-muted-foreground">
                      <th className="border border-border px-4 py-2 text-left">Hizmet</th>
                      <th className="border border-border px-4 py-2 text-right">İşlem Sayısı</th>
                      <th className="border border-border px-4 py-2 text-right">Toplam Ciro</th>
                      <th className="border border-border px-4 py-2 text-right">Yüzde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceData.map((service) => (
                      <tr key={service.name} className="border-b border-border hover:bg-muted">
                        <td className="border border-border px-4 py-2 font-semibold">{service.name}</td>
                        <td className="border border-border px-4 py-2 text-right">{service.count}</td>
                        <td className="border border-border px-4 py-2 text-right">
                          {formatCurrency(service.revenue)}
                        </td>
                        <td className="border border-border px-4 py-2 text-right">
                          {service.percentage?.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold bg-muted">
                      <td className="border border-border px-4 py-2">Toplam</td>
                      <td className="border border-border px-4 py-2 text-right">
                        {serviceData.reduce((acc, cur) => acc + cur.count, 0)}
                      </td>
                      <td className="border border-border px-4 py-2 text-right">
                        {formatCurrency(serviceData.reduce((acc, cur) => acc + cur.revenue, 0))}
                      </td>
                      <td className="border border-border px-4 py-2 text-right">
                        {serviceData.reduce((acc, cur) => acc + (cur.percentage || 0), 0).toFixed(2)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}

