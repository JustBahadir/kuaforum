
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

interface RevenueSourceChartProps {
  data: ServiceDataItem[];
  isLoading: boolean;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export function RevenueSourceChart({ data, isLoading }: RevenueSourceChartProps) {
  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // Enhanced data with calculated percentages
  const enhancedData = data.map(item => ({
    ...item,
    revenuePercent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    countPercent: totalCount > 0 ? (item.count / totalCount) * 100 : 0
  }));

  // Custom label formatter
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small slices

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-200">
          <p className="font-bold text-lg mb-2">{item.name}</p>
          <p className="text-sm mb-1">Ciro: {formatCurrency(item.revenue)} ({item.revenuePercent.toFixed(1)}%)</p>
          <p className="text-sm mb-1">İşlem Sayısı: {item.count} ({item.countPercent.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>İşlem Dağılımı (Gelir Kaynakları)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[500px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[500px]">
            <p className="text-muted-foreground">Bu aralıkta veri bulunamadı</p>
          </div>
        ) : (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enhancedData}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={180}
                  fill="#8884d8"
                >
                  {enhancedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry: any, index) => (
                    <span className="text-sm font-medium flex items-center">
                      <span 
                        className="inline-block w-3 h-3 mr-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && data.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşlem</TableHead>
                  <TableHead className="text-right">İşlem Sayısı</TableHead>
                  <TableHead className="text-right">İşlem Yüzdesi (%)</TableHead>
                  <TableHead className="text-right">Ciro</TableHead>
                  <TableHead className="text-right">Ciro Yüzdesi (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedData.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 mr-2 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {service.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{service.count}</TableCell>
                    <TableCell className="text-right">{service.countPercent.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                    <TableCell className="text-right">{service.revenuePercent.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
