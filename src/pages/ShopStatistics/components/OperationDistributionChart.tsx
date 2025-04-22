
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface OperationData {
  name: string;
  count: number;
  revenue: number;
}

interface OperationDistributionChartProps {
  data: OperationData[];
  isLoading?: boolean;
}

export function OperationDistributionChart({ data, isLoading = false }: OperationDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İşlem Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İşlem Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>İşlem verisi bulunamadı</p>
            <p className="text-sm mt-2">Lütfen işlem kayıtlarınızı güncel tutun.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total revenue and operations
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOperations = data.reduce((sum, item) => sum + item.count, 0);

  // Add percentage calculation to data
  const enhancedData = data.map(item => ({
    ...item,
    revenuePercent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    countPercent: totalOperations > 0 ? (item.count / totalOperations) * 100 : 0
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-semibold text-lg mb-2">{data.name}</p>
          <p className="text-sm mb-1">İşlem Sayısı: <span className="font-medium">{data.count}</span> ({data.countPercent.toFixed(1)}%)</p>
          <p className="text-sm mb-1">Ciro: <span className="font-medium text-green-600">
            {formatCurrency(data.revenue)}</span> ({data.revenuePercent.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">İşlem Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div className={`${data.length > 5 ? 'min-w-[800px]' : 'w-full'} h-[450px] p-4`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enhancedData.sort((a, b) => b.count - a.count)} // Sort by count descending
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                barSize={40}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{
                    fontSize: 12,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ paddingLeft: "20px" }}
                />
                <Bar 
                  dataKey="count" 
                  name="İşlem Sayısı" 
                  fill="#8884d8" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>

        {/* Data Table */}
        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İşlem</TableHead>
                <TableHead className="text-right">İşlem Sayısı</TableHead>
                <TableHead className="text-right">Yüzde (%)</TableHead>
                <TableHead className="text-right">Ciro</TableHead>
                <TableHead className="text-right">Ciro Yüzdesi (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enhancedData.map((operation, index) => (
                <TableRow key={index}>
                  <TableCell>{operation.name}</TableCell>
                  <TableCell className="text-right">{operation.count}</TableCell>
                  <TableCell className="text-right">{operation.countPercent.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(operation.revenue)}</TableCell>
                  <TableCell className="text-right">{operation.revenuePercent.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
