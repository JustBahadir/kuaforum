
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ServiceEvaluationProps {
  data: any;
  isLoading: boolean;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export function ServiceEvaluation({ data, isLoading }: ServiceEvaluationProps) {
  const [view, setView] = useState<"revenue" | "count">("revenue");
  
  const serviceData = useMemo(() => {
    if (isLoading || !data.operations || !data.services) {
      return [];
    }

    const operations = data.operations;
    const services = data.services;
    
    const serviceMap = new Map();
    
    operations.forEach((op: any) => {
      const serviceId = op.islem_id;
      const service = services.find((s: any) => s.id === serviceId);
      const serviceName = service?.islem_adi || op.aciklama || "Diğer";
      
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { name: serviceName, revenue: 0, count: 0 });
      }
      
      const entry = serviceMap.get(serviceName);
      entry.revenue += op.tutar || 0;
      entry.count += 1;
    });
    
    return Array.from(serviceMap.values())
      .sort((a, b) => view === "revenue" ? b.revenue - a.revenue : b.count - a.count);
  }, [data, isLoading, view]);
  
  // Format tooltip contents based on view
  const formatTooltip = (value: number, name: string) => {
    if (name === "revenue") {
      return [formatCurrency(value), "Ciro"];
    }
    if (name === "count") {
      return [value, "İşlem Sayısı"];
    }
    return [value, name];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Hizmet Değerlendirme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (serviceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hizmet Değerlendirme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Veri bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  // Get top 5 services for pie chart
  const topServices = serviceData.slice(0, 5);
  const otherServices = serviceData.slice(5);
  
  let pieData = [...topServices];
  
  // Add "other" category if needed
  if (otherServices.length > 0) {
    const otherRevenue = otherServices.reduce((sum, service) => sum + service.revenue, 0);
    const otherCount = otherServices.reduce((sum, service) => sum + service.count, 0);
    
    pieData.push({
      name: "Diğer",
      revenue: otherRevenue,
      count: otherCount
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Hizmet Değerlendirme</CardTitle>
          <Tabs defaultValue="revenue" value={view} onValueChange={(v: any) => setView(v)}>
            <TabsList>
              <TabsTrigger value="revenue">Ciro</TabsTrigger>
              <TabsTrigger value="count">İşlem Sayısı</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 p-4">
          <ScrollArea className="h-[300px]">
            <div className="min-w-[500px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Bar dataKey={view} fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]}>
                    {serviceData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
