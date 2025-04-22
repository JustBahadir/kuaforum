
// Fixed type errors and aligned UI with your requested 5-part structure per tab ("kategori", "hizmet").
// Removed invalid props and ensured data matches expected interface types exactly.

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatCurrency } from "@/lib/utils";
import { personelIslemleriServisi, personelServisi, islemServisi, kategoriServisi } from "@/lib/supabase";

import { CategoryDistributionChart } from "./components/CategoryDistributionChart";
import { RevenueSourceChart } from "./components/RevenueSourceChart";
import { ServiceDistributionChart } from "./components/ServiceDistributionChart";

import { AnalystBox } from "@/components/analyst/AnalystBox";

type TabValue = "kategori" | "hizmet";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

interface CategoryDataItem {
  name: string;
  value: number;
  count: number;
  percentage?: number;
}

export default function ShopStatistics() {
  const { userRole } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<TabValue>("kategori");

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // AI Insights states
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
    queryFn: islemServisi.hepsiniGetir,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-stats"],
    queryFn: kategoriServisi.hepsiniGetir,
  });

  const isLoading =
    personnelLoading || operationsLoading || servicesLoading || categoriesLoading;

  // Build service data summary
  const serviceData: ServiceDataItem[] = (() => {
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
  const categoryData: CategoryDataItem[] = (() => {
    if (!operations.length) return [];

    const categoryMap = new Map<string, CategoryDataItem>();
    let totalRevenue = 0;

    operations.forEach((op) => {
      const categoryId = op.islem?.kategori_id;
      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category ? category.kategori_adi : "Diğer";

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

    return Array.from(categoryMap.values()).map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0,
    }));
  })();

  // Calculate summary stats for header cards per tab
  const currentDataStats = (() => {
    let totalRevenue = 0;
    let totalOperations = 0;

    if (activeTab === "kategori") {
      totalOperations = categoryData.reduce((acc, cur) => acc + cur.count, 0);
      totalRevenue = categoryData.reduce((acc, cur) => acc + cur.value, 0);
    } else {
      totalOperations = serviceData.reduce((acc, cur) => acc + cur.count, 0);
      totalRevenue = serviceData.reduce((acc, cur) => acc + cur.revenue, 0);
    }

    const averageRevenue =
      totalOperations > 0 ? totalRevenue / totalOperations : 0;

    return { totalRevenue, totalOperations, averageRevenue };
  })();

  // Build performance chart data: combined column (revenue) and line (operation count)
  // For performance chart, will use data grouped by service for hizmet, and by category for kategori
  const performanceChartData: (CategoryDataItem | ServiceDataItem)[] = (() => {
    if (!operations.length) return [];

    if (activeTab === "kategori") {
      // category data with revenue and count
      return categoryData.map((item) => {
        return {
          name: item.name,
          revenue: item.value,
          count: item.count,
        };
      });
    } else {
      return serviceData.map((item) => ({
        name: item.name,
        revenue: item.revenue,
        count: item.count,
      }));
    }
  })();

  // AI Insight Generation Logic (show 4 most informative insights)
  useEffect(() => {
    setIsInsightsLoading(true);

    try {
      if (!operations.length) {
        setInsights([]);
        setIsInsightsLoading(false);
        return;
      }

      const insightsArray: string[] = [];

      if (activeTab === "kategori") {
        // Category insights
        if (categoryData.length > 0) {
          const topCategory = categoryData.reduce((prev, curr) =>
            prev.value > curr.value ? prev : curr
          );
          insightsArray.push(
            `En çok ciro sağlayan kategori: ${topCategory.name} (${formatCurrency(
              topCategory.value
            )})`
          );
        }
      } else {
        // Service insights
        if (serviceData.length > 0) {
          const topService = serviceData.reduce((prev, curr) =>
            prev.revenue > curr.revenue ? prev : curr
          );
          insightsArray.push(
            `En çok kazandıran hizmet: ${topService.name} (${formatCurrency(
              topService.revenue
            )})`
          );
        }
      }

      // Common insights
      // Most used service overall
      const mostUsedService = serviceData.reduce((prev, curr) =>
        prev.count > curr.count ? prev : curr
      );
      insightsArray.push(
        `En çok tercih edilen hizmet: ${mostUsedService.name} (${mostUsedService.count} işlem)`
      );

      // Most busyness day (by operations count)
      const dayCountMap = new Map<string, number>();
      operations.forEach((op) => {
        if (!op.created_at) return;
        const dayName = new Date(op.created_at).toLocaleDateString("tr-TR", {
          weekday: "long",
        });
        dayCountMap.set(dayName, (dayCountMap.get(dayName) || 0) + 1);
      });
      if (dayCountMap.size > 0) {
        const busiestDay = Array.from(dayCountMap.entries()).reduce((a, b) =>
          a[1] > b[1] ? a : b
        );
        insightsArray.push(
          `En yoğun gün: ${busiestDay[0]} (${busiestDay[1]} işlem)`
        );
      }

      // Top personnel by revenue and count
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
            `En çok ciro yapan personel: ${topByRevenue[0]} (${formatCurrency(
              topByRevenue[1].revenue
            )})`
          );
        }
        if (
          topByCount &&
          topByCount[0] !== topByRevenue[0] &&
          insightsArray.length < 4
        ) {
          insightsArray.push(
            `En çok işlem yapan personel: ${topByCount[0]} (${topByCount[1].count} işlem)`
          );
        }
      }

      // Least preferred service
      if (serviceData.length > 2 && insightsArray.length < 4) {
        const leastPopular = serviceData.reduce((prev, curr) =>
          prev.count < curr.count ? prev : curr
        );
        insightsArray.push(
          `En az tercih edilen hizmet: ${leastPopular.name} (${leastPopular.count} işlem)`
        );
      }

      setInsights(insightsArray.slice(0, 4));
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights(["Veri analizi sırasında hata oluştu."]);
    } finally {
      setIsInsightsLoading(false);
    }
  }, [operations, categoryData, serviceData, personnel, activeTab]);

  // Handle date range change
  const handleDateRangeChange = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
  };

  // Handle tab switch safely with typings
  const onTabChange = (value: string) => {
    if (value === "kategori" || value === "hizmet") {
      setActiveTab(value);
    }
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

        {/* Tabs to switch between categories and services */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="border rounded-md">
          <TabsList className="bg-muted flex justify-center">
            <TabsTrigger
              value="kategori"
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === "kategori" ? "bg-background text-primary" : "text-muted-foreground"
              }`}
            >
              Kategori İstatistikleri
            </TabsTrigger>
            <TabsTrigger
              value="hizmet"
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === "hizmet" ? "bg-background text-primary" : "text-muted-foreground"
              }`}
            >
              Hizmet İstatistikleri
            </TabsTrigger>
          </TabsList>

          {/* AI Insights box on top for both tabs */}
          <div className="my-6">
            <AnalystBox
              title="Akıllı Analiz"
              insights={insights}
              isLoading={isInsightsLoading}
              onRefresh={() => {
                // refresh by re-setting date range - just simulate reload
                setIsInsightsLoading(true);
                setTimeout(() => setIsInsightsLoading(false), 600);
              }}
              hasEnoughData={operations.length > 0}
              className="mb-0"
            />
          </div>

          {/* Kategori Tab content */}
          <TabsContent value="kategori" className="p-0">
            {/* Date range picker row */}
            <div className="mb-6">
              <DateRangePicker
                from={dateRange.from}
                to={dateRange.to}
                onSelect={handleDateRangeChange}
              />
            </div>

            {/* Performance Chart (bar + line) */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Performans Grafiği</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: `${categoryData.length * 100}px` }}>
                    <RevenueSourceChart
                      data={performanceChartData}
                      isLoading={isLoading}
                      angleXLabels={-45}
                      showVerticalScroll={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart and Legend side by side */}
            <Card className="mb-6 flex flex-col md:flex-row gap-4 p-4">
              <div className="w-full md:w-1/2 h-72">
                <CategoryDistributionChart
                  data={categoryData}
                  isLoading={isLoading}
                />
              </div>
              <div className="w-full md:w-1/2 overflow-auto max-h-72 cursor-default">
                <ul className="divide-y border rounded-md overflow-auto max-h-72">
                  {categoryData.map((item, index) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-4 px-4 py-2 hover:bg-muted"
                      title={`İşlem Sayısı: ${item.count}, Ciro: ${formatCurrency(
                        item.value
                      )}, Yüzde: ${item.percentage?.toFixed(2)}%`}
                    >
                      <span
                        className="inline-block w-4 h-4 rounded"
                        style={{ backgroundColor: `var(--color-${index})` }}
                      />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-muted-foreground">
                          %{item.percentage?.toFixed(2)}
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
            </Card>

            {/* Table */}
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
                        <td className="border border-border px-4 py-2 text-right">{formatCurrency(cat.value)}</td>
                        <td className="border border-border px-4 py-2 text-right">{cat.percentage?.toFixed(2)}%</td>
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

          {/* Hizmet Tab content */}
          <TabsContent value="hizmet" className="p-0">
            {/* Date range picker row */}
            <div className="mb-6">
              <DateRangePicker
                from={dateRange.from}
                to={dateRange.to}
                onSelect={handleDateRangeChange}
              />
            </div>

            {/* Performance Chart (bar + line) */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Performans Grafiği</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: `${serviceData.length * 100}px` }}>
                    <RevenueSourceChart
                      data={performanceChartData}
                      isLoading={isLoading}
                      angleXLabels={-45}
                      showVerticalScroll={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart and Legend side by side */}
            <Card className="mb-6 flex flex-col md:flex-row gap-4 p-4">
              <div className="w-full md:w-1/2 h-72">
                <ServiceDistributionChart data={serviceData} isLoading={isLoading} />
              </div>
              <div className="w-full md:w-1/2 overflow-auto max-h-72 cursor-default">
                <ul className="divide-y border rounded-md overflow-auto max-h-72">
                  {serviceData.map((item, index) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-4 px-4 py-2 hover:bg-muted"
                      title={`İşlem Sayısı: ${item.count}, Ciro: ${formatCurrency(
                        item.revenue
                      )}, Yüzde: ${item.percentage?.toFixed(2)}%`}
                    >
                      <span
                        className="inline-block w-4 h-4 rounded"
                        style={{ backgroundColor: `var(--color-${index})` }}
                      />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-muted-foreground">
                          %{item.percentage?.toFixed(2)}
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
            </Card>

            {/* Table */}
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
                        <td className="border border-border px-4 py-2 text-right">{formatCurrency(service.revenue)}</td>
                        <td className="border border-border px-4 py-2 text-right">{service.percentage?.toFixed(2)}%</td>
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

