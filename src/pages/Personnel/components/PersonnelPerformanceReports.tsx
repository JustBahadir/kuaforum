import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateControlBar } from "@/components/ui/date-control-bar";
import { AnalystBox } from "@/components/analyst/AnalystBox";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line, Legend, TooltipProps
} from "recharts";
import { PieChart, Pie } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface Operation {
  id: number | string;
  created_at: string | Date;
  personel_id?: number | string;
  personel?: { ad_soyad?: string };
  musteri?: { first_name?: string; last_name?: string };
  islem?: { islem_adi?: string };
  aciklama?: string;
  tutar?: number | string;
  odenen?: number | string;
  prim_yuzdesi?: number | string;
}

function generateInsights(operations: Operation[], personnel: { id: number; ad_soyad: string }[]) {
  if (operations.length === 0) return ["Seçili tarih aralığında veri bulunmamaktadır."];

  const insights: string[] = [];

  // Calculate revenue per personnel
  const revenueByPersonnel: Record<string, number> = {};
  operations.forEach(op => {
    if (!op.personel_id) return;
    const tutarValue = typeof op.tutar === "number" ? op.tutar : Number(op.tutar) || 0;
    revenueByPersonnel[String(op.personel_id)] = (revenueByPersonnel[String(op.personel_id)] || 0) + tutarValue;
  });
  const maxRevenuePersonelId = Object.entries(revenueByPersonnel).reduce(
    (a, b) => (a[1] > b[1] ? a : b),
    [null, 0]
  )[0];
  const maxRevenuePersonelName =
    personnel.find(p => p.id === Number(maxRevenuePersonelId))?.ad_soyad || "Bilinmeyen";

  insights.push(
    `En yüksek ciroyu ${maxRevenuePersonelName} elde etti (${formatCurrency(revenueByPersonnel[maxRevenuePersonelId || ""] || 0)}).`
  );

  // Most operation count
  const countByPersonnel: Record<string, number> = {};
  operations.forEach(op => {
    if (!op.personel_id) return;
    countByPersonnel[String(op.personel_id)] = (countByPersonnel[String(op.personel_id)] || 0) + 1;
  });
  const maxCountPersonelId = Object.entries(countByPersonnel).reduce(
    (a, b) => (a[1] > b[1] ? a : b),
    [null, 0]
  )[0];
  const maxCountPersonelName =
    personnel.find(p => p.id === Number(maxCountPersonelId))?.ad_soyad || "Bilinmeyen";
  insights.push(`En çok işlemi ${maxCountPersonelName} gerçekleştirdi (${countByPersonnel[maxCountPersonelId || ""] || 0} işlem).`);

  // Most revenue service
  const revenueByService: Record<string, number> = {};
  operations.forEach(op => {
    const serviceName = op.islem?.islem_adi || "Diğer";
    const tutarValue = typeof op.tutar === "number" ? op.tutar : Number(op.tutar) || 0;
    revenueByService[serviceName] = (revenueByService[serviceName] || 0) + tutarValue;
  });
  const maxRevenueService = Object.entries(revenueByService).reduce(
    (a, b) => (a[1] > b[1] ? a : b),
    [null, 0]
  );
  if (maxRevenueService[0]) {
    insights.push(`En yüksek gelir getiren hizmet: ${maxRevenueService[0]} (${formatCurrency(maxRevenueService[1])}).`);
  }

  return insights;
}

export function PersonnelPerformanceReports({ personnelId = null }: { personnelId?: number | null }) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const { data: personnel = [] } = useQuery({
    queryKey: ['personnel'],
    queryFn: () => import("@/lib/supabase").then(mod => mod.personelServisi.hepsiniGetir()),
  });

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personel-operations', personnelId, dateRange.from, dateRange.to],
    queryFn: () => personnelId ? personelIslemleriServisi.personelIslemleriGetir(personnelId) : Promise.resolve([]),
    enabled: personnelId != null,
  });

  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      if (!op.created_at) return false;
      const opDate = new Date(op.created_at);
      return opDate >= dateRange.from && opDate <= dateRange.to;
    });
  }, [operations, dateRange]);

  const totalRevenue = useMemo(() => filteredOperations.reduce((sum, op) => {
    const tutarVal = typeof op.tutar === "number" ? op.tutar : Number(op.tutar) || 0;
    return sum + tutarVal;
  }, 0), [filteredOperations]);

  const totalCommission = useMemo(() => filteredOperations.reduce((sum, op) => {
    const odenenVal = typeof op.odenen === "number" ? op.odenen : Number(op.odenen) || 0;
    return sum + odenenVal;
  }, 0), [filteredOperations]);

  const operationCount = filteredOperations.length;

  const dailyDataMap = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; operations: number }>();
    filteredOperations.forEach(op => {
      if (!op.created_at) return;
      const d = new Date(op.created_at);
      const key = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
      if (!map.has(key)) {
        map.set(key, { date: key, revenue: 0, operations: 0 });
      }
      const entry = map.get(key)!;
      const tutarVal = typeof op.tutar === "number" ? op.tutar : Number(op.tutar) || 0;
      entry.revenue += tutarVal;
      entry.operations += 1;
    });
    return Array.from(map.values());
  }, [filteredOperations]);

  const serviceDataMap = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; count: number }>();
    filteredOperations.forEach(op => {
      if (!op.islem) return;
      const serviceName = op.islem.islem_adi || "Diğer";
      const entry = map.get(serviceName) || { name: serviceName, revenue: 0, count: 0 };
      const tutarVal = typeof op.tutar === "number" ? op.tutar : Number(op.tutar) || 0;
      entry.revenue += tutarVal;
      entry.count += 1;
      map.set(serviceName, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOperations]);

  const tableData = filteredOperations.slice();

  const [debouncedOps, setDebouncedOps] = useState(filteredOperations);
  const debounceTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = window.setTimeout(() => setDebouncedOps(filteredOperations), 500);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [filteredOperations]);

  const [insights, setInsights] = useState<string[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  useEffect(() => {
    setIsInsightsLoading(true);
    const generated = generateInsights(debouncedOps, personnel);
    setInsights(generated);
    setIsInsightsLoading(false);
  }, [debouncedOps, personnel]);

  const customTooltipFormatter = (value: ValueType, name: string) => {
    if (name === 'revenue') {
      const numValue = Number(value);
      return [`Ciro: ${formatCurrency(numValue)}`, "Ciro"];
    } else if (name === 'operations') {
      return [`İşlem Sayısı: ${value}`, "İşlem Sayısı"];
    }
    return [String(value), name];
  };

  return (
    <div className="space-y-6">
      <AnalystBox
        title="Akıllı Analiz"
        insights={insights}
        isLoading={isInsightsLoading}
        onRefresh={() => {
          setIsInsightsLoading(true);
          setTimeout(() => setIsInsightsLoading(false), 600);
        }}
        className="mb-6"
      />

      <DateControlBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <Card>
        <CardHeader>
          <CardTitle>Performans Grafiği</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Seçilen tarih aralığındaki günlük işlem sayısı ve ciro
          </p>
        </CardHeader>
        <CardContent style={{ overflowX: "auto" }}>
          <div style={{ minWidth: `${dailyDataMap.length * 70}px`, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyDataMap}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left" 
                  tickFormatter={(v) => `₺${v}`} 
                  domain={[0, 'auto']}
                  label={{ value: 'Ciro (₺)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 'auto']}
                  label={{ value: 'İşlem Sayısı', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  labelFormatter={(label) => `Tarih: ${label}`}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="revenue" 
                  name="Ciro" 
                  fill="#8b5cf6" 
                  radius={[4,4,0,0]} 
                  barSize={30} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="operations" 
                  name="İşlem Sayısı" 
                  stroke="#a78bfa" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:flex md:flex-row md:gap-6 p-4">
        <div className="md:w-1/2 h-72">
          <PieChart width={380} height={280}>
            <Pie
              data={serviceDataMap}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8b5cf6"
              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {serviceDataMap.map((entry, index) => {
                const colors = ["#a78bfa", "#c4b5fd", "#d8b4fe", "#e9d5ff", "#f3e8ff"];
                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
              })}
            </Pie>
          </PieChart>
        </div>

        <div className="md:w-1/2 flex flex-col justify-center p-4">
          <h3 className="font-semibold mb-4">Hizmet Dağılımı</h3>
          <ul className="space-y-2">
            {serviceDataMap.map((service, idx) => {
              const percent = totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : "0.0";
              return (
                <li key={idx} className="flex items-center gap-4 text-sm cursor-default select-none">
                  <span 
                    className="inline-block w-4 h-4" 
                    style={{ backgroundColor: ["#a78bfa", "#c4b5fd", "#d8b4fe", "#e9d5ff", "#f3e8ff"][idx % 5] }} 
                  />
                  <span className="flex-grow">{service.name}</span>
                  <span>%{percent}</span>
                  <span>({service.count} işlem)</span>
                  <span>{formatCurrency(service.revenue)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      <Card className="overflow-auto">
        <CardHeader>
          <CardTitle>Performans Detayları</CardTitle>
        </CardHeader>
        <div className="min-w-[900px]">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">Veri bulunamadı.</td>
                </tr>
              ) : (
                tableData.map(op => (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{new Date(op.created_at).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{op.personel?.ad_soyad || "Bilinmeyen"}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{op.musteri?.first_name} {op.musteri?.last_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{op.islem?.islem_adi || op.aciklama?.split(" hizmeti verildi")[0]}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(typeof op.tutar === "number" ? op.tutar : Number(op.tutar) || 0)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900"> %{op.prim_yuzdesi} </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(typeof op.odenen === "number" ? op.odenen : Number(op.odenen) || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
