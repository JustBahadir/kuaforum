
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for percentages
  const totalCiro = data.reduce((sum, item) => sum + item.ciro, 0);
  const totalIslem = data.reduce((sum, item) => sum + item.islemSayisi, 0);

  // Enhanced data with percentages
  const enhancedData = data.map(item => ({
    ...item,
    ciroPercent: totalCiro > 0 ? (item.ciro / totalCiro) * 100 : 0,
    islemPercent: totalIslem > 0 ? (item.islemSayisi / totalIslem) * 100 : 0
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-semibold text-lg mb-2">{item.name}</p>
          <p className="text-sm mb-1">İşlem Sayısı: <span className="font-medium">{item.islemSayisi}</span> ({item.islemPercent.toFixed(1)}%)</p>
          <p className="text-sm mb-1">Ciro: <span className="font-medium text-green-600">
            {formatCurrency(item.ciro)}</span> ({item.ciroPercent.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full h-[500px]">
          <div className="min-w-[800px] h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={enhancedData}
                margin={{ top: 20, right: 80, left: 20, bottom: 40 }}
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
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
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
        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hizmet</TableHead>
                <TableHead className="text-right">İşlem Sayısı</TableHead>
                <TableHead className="text-right">İşlem Yüzdesi (%)</TableHead>
                <TableHead className="text-right">Ciro</TableHead>
                <TableHead className="text-right">Ciro Yüzdesi (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enhancedData.map((service, index) => (
                <TableRow key={index}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell className="text-right">{service.islemSayisi}</TableCell>
                  <TableCell className="text-right">{service.islemPercent.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(service.ciro)}</TableCell>
                  <TableCell className="text-right">{service.ciroPercent.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
