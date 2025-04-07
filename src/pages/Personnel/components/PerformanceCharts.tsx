
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { PersonelIslemi } from "@/lib/supabase/types";
import { PersonnelAnalyst } from "@/components/analyst/PersonnelAnalyst";

interface PerformanceChartsProps {
  personeller: any[];
  islemGecmisi: PersonelIslemi[];
}

export function PerformanceCharts({
  personeller,
  islemGecmisi,
}: PerformanceChartsProps) {
  // Process data for charts
  const personnelStats = personeller.map((personel) => {
    const personelIslemleri = islemGecmisi.filter(
      (islem) => islem.personel_id === personel.id
    );
    const totalRevenue = personelIslemleri.reduce(
      (sum, islem) => sum + (islem.tutar || 0),
      0
    );
    const operationCount = personelIslemleri.length;
    const averageRating =
      personelIslemleri.length > 0
        ? personelIslemleri.reduce(
            (sum, islem) => sum + (islem.puan || 0),
            0
          ) / personelIslemleri.length
        : 0;
    return {
      name: personel.ad_soyad || "İsimsiz",
      ciro: totalRevenue,
      islemSayisi: operationCount,
      puan: averageRating,
      personelId: personel.id,
    };
  }).filter((item) => item.islemSayisi > 0);

  // Colors for pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ciro Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={personnelStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="ciro"
                >
                  {personnelStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İşlem Sayısı</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={personnelStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => value} />
                <Legend />
                <Bar
                  dataKey="islemSayisi"
                  fill="#8884d8"
                  name="İşlem Sayısı"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Performance Analyst */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Puanlama</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={personnelStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  tickCount={6}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Bar
                  dataKey="puan"
                  fill="#00C49F"
                  name="Ortalama Puan"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Add the analyst component in the second column */}
        <PersonnelAnalyst />
      </div>
    </div>
  );
}
