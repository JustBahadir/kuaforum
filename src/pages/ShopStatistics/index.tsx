
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { tr } from "date-fns/locale";
import { DateRangeControls } from "./components/DateRangeControls";
import { MetricsCards } from "./components/MetricsCards";
import { StatisticsData } from "./components/StatisticsData";
import { ChartArea } from "@/components/ui/chart-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

export default function ShopStatistics() {
  const [currentView, setCurrentView] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  
  // Initial date range: current month
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for demonstration
  const metrics = {
    totalRevenue: 15750.50,
    totalAppointments: 36,
    newCustomers: 12,
    completionRate: 89,
  };

  // Sample chart data
  const revenueData = Array.from({ length: 30 }, (_, i) => ({
    date: format(addDays(new Date(2023, 0, 1), i), "yyyy-MM-dd"),
    value: Math.floor(Math.random() * 1000) + 500,
  }));

  const appointmentsData = Array.from({ length: 30 }, (_, i) => ({
    date: format(addDays(new Date(2023, 0, 1), i), "yyyy-MM-dd"),
    value: Math.floor(Math.random() * 10) + 1,
  }));

  const selectPreviousPeriod = () => {
    setIsLoading(true);
    
    switch (currentView) {
      case "daily":
        setDateRange({
          from: addDays(dateRange.from, -1),
          to: addDays(dateRange.to, -1),
        });
        break;
      case "weekly":
        setDateRange({
          from: addDays(dateRange.from, -7),
          to: addDays(dateRange.to, -7),
        });
        break;
      case "monthly":
        setDateRange({
          from: startOfMonth(subMonths(dateRange.from, 1)),
          to: endOfMonth(subMonths(dateRange.from, 1)),
        });
        break;
      case "yearly":
        setDateRange({
          from: new Date(dateRange.from.getFullYear() - 1, 0, 1),
          to: new Date(dateRange.from.getFullYear() - 1, 11, 31),
        });
        break;
    }
    
    setTimeout(() => setIsLoading(false), 500);
  };

  const selectNextPeriod = () => {
    setIsLoading(true);
    
    switch (currentView) {
      case "daily":
        setDateRange({
          from: addDays(dateRange.from, 1),
          to: addDays(dateRange.to, 1),
        });
        break;
      case "weekly":
        setDateRange({
          from: addDays(dateRange.from, 7),
          to: addDays(dateRange.to, 7),
        });
        break;
      case "monthly":
        setDateRange({
          from: startOfMonth(addDays(endOfMonth(dateRange.from), 1)),
          to: endOfMonth(addDays(endOfMonth(dateRange.from), 1)),
        });
        break;
      case "yearly":
        setDateRange({
          from: new Date(dateRange.from.getFullYear() + 1, 0, 1),
          to: new Date(dateRange.from.getFullYear() + 1, 11, 31),
        });
        break;
    }
    
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">İstatistikler</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {format(dateRange.from, "dd MMM yyyy", { locale: tr })} -{" "}
                      {format(dateRange.to, "dd MMM yyyy", { locale: tr })}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button variant="outline" onClick={selectPreviousPeriod} disabled={isLoading}>
              ←
            </Button>
            <Button variant="outline" onClick={selectNextPeriod} disabled={isLoading}>
              →
            </Button>
          </div>
        </div>
        
        <Tabs
          value={currentView}
          onValueChange={(v) => setCurrentView(v as any)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="daily">Günlük</TabsTrigger>
            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
            <TabsTrigger value="yearly">Yıllık</TabsTrigger>
          </TabsList>
          
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Toplam Ciro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(metrics.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Son döneme göre +5%
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Toplam Randevu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Son döneme göre +12%
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Yeni Müşteriler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.newCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Son döneme göre +8%
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tamamlanma Oranı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Son döneme göre +2%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ciro Grafiği</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartArea
                    data={revenueData}
                    xField="date"
                    yField="value"
                    formatY={(value) => `₺${value}`}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Randevu Grafiği</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartArea
                    data={appointmentsData}
                    xField="date"
                    yField="value"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Service Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Hizmet Performansı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <span>Hizmet {i + 1}</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(1000 + i * 500)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${80 - i * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
