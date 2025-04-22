
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm">İşlem Sayısı: <span className="font-medium">{payload[0].value}</span></p>
          <p className="text-sm">Toplam Gelir: <span className="font-medium text-green-600">
            {formatCurrency(payload[0].payload.revenue)}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">İşlem Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className={`${data.length > 5 ? 'min-w-[800px]' : 'w-full'} h-full p-4`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.sort((a, b) => b.count - a.count)} // Sort by count descending
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
                <Legend />
                <Bar dataKey="count" name="İşlem Sayısı" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>

        {/* Data Table */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">İşlem</th>
                <th className="py-2 px-4 text-right">İşlem Sayısı</th>
                <th className="py-2 px-4 text-right">Ciro</th>
              </tr>
            </thead>
            <tbody>
              {data.map((operation, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-left">{operation.name}</td>
                  <td className="py-2 px-4 text-right">{operation.count}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(operation.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
