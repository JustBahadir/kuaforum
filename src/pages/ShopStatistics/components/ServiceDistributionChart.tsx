
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface ServiceDistributionChartProps {
  data: ChartDataItem[];
  isLoading?: boolean;
  title?: string;
}

export function ServiceDistributionChart({ 
  data, 
  isLoading = false, 
  title = "Hizmet Performansı" 
}: ServiceDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm">İşlem Sayısı: <span className="font-medium">{payload[0].payload.islemSayisi}</span></p>
          <p className="text-sm">Ciro: <span className="font-medium text-green-600">
            {formatCurrency(payload[0].payload.ciro)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ScrollArea className="w-full h-full">
          <div className="min-w-[600px] h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => `₺${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right" 
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="ciro" 
                  name="Ciro (₺)" 
                  fill="#8884d8" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="islemSayisi" 
                  name="İşlem Sayısı" 
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Data Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Hizmet</th>
                <th className="py-2 px-4 text-right">İşlem Sayısı</th>
                <th className="py-2 px-4 text-right">Ciro</th>
              </tr>
            </thead>
            <tbody>
              {data.map((service, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-left">{service.name}</td>
                  <td className="py-2 px-4 text-right">{service.islemSayisi}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(service.ciro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
