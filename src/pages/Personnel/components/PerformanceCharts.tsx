
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PerformanceChartsProps {
  personeller: any[];
  islemGecmisi: any[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const [chartType, setChartType] = useState<'personel-revenue' | 'operation-count' | 'commission'>('personel-revenue');

  const chartData = useMemo(() => {
    if (personeller.length === 0 || islemGecmisi.length === 0) {
      return [];
    }

    // Create a map to store personnel data
    const personnelMap = new Map();

    // Initialize the map with all personnel
    personeller.forEach(p => {
      personnelMap.set(p.id, {
        id: p.id,
        name: p.ad_soyad,
        revenue: 0,
        operations: 0,
        commissions: 0
      });
    });

    // Aggregate data from operations history
    islemGecmisi.forEach(islem => {
      // Make sure personel_id exists and is in our map
      if (islem.personel_id && personnelMap.has(islem.personel_id)) {
        const personnel = personnelMap.get(islem.personel_id);
        
        // Ensure tutar and odenen are treated as numbers
        const tutar = typeof islem.tutar === 'number' ? islem.tutar : Number(islem.tutar || 0);
        const odenen = typeof islem.odenen === 'number' ? islem.odenen : Number(islem.odenen || 0);
        
        // Add data to personnel
        personnel.revenue += tutar;
        personnel.operations += 1;
        personnel.commissions += odenen;
      }
    });
    
    // Convert map to array
    return Array.from(personnelMap.values())
      .filter(p => p.revenue > 0 || p.operations > 0 || p.commissions > 0); // Only include personnel with data
  }, [personeller, islemGecmisi]);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"];

  const chartConfig = {
    'personel-revenue': {
      title: "Personel Bazında Ciro Dağılımı",
      dataKey: "revenue",
      formatter: (value: number) => formatCurrency(value)
    },
    'operation-count': {
      title: "Personel Bazında İşlem Sayısı",
      dataKey: "operations",
      formatter: (value: number) => `${value} işlem`
    },
    'commission': {
      title: "Personel Bazında Ödenen Komisyon",
      dataKey: "commissions",
      formatter: (value: number) => formatCurrency(value)
    }
  };

  const selectedConfig = chartConfig[chartType];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{selectedConfig.title}</CardTitle>
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Grafik Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personel-revenue">Ciro Dağılımı</SelectItem>
              <SelectItem value="operation-count">İşlem Sayısı</SelectItem>
              <SelectItem value="commission">Komisyon Dağılımı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey={selectedConfig.dataKey}
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={selectedConfig.formatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={selectedConfig.formatter} />
                <Bar dataKey={selectedConfig.dataKey} fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
