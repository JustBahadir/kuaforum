
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface ServicePerformanceChartProps {
  data: ServiceDataItem[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export function ServicePerformanceChart({ data, isLoading }: ServicePerformanceChartProps) {
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string, entry: any) => {
    const dataEntry = entry.payload;
    if (name === 'revenue') {
      return [formatCurrency(value), 'Gelir'];
    }
    return [value, 'İşlem Sayısı'];
  };
  
  // Custom label formatter
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hizmet Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Process data for the pie chart
  const revenueData = data.map(item => ({
    name: item.name,
    value: item.revenue
  }));
  
  const countData = data.map(item => ({
    name: item.name,
    value: item.count
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hizmet Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <p className="text-center text-sm font-medium mb-2">Gelir Dağılımı</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-revenue-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-[300px]">
            <p className="text-center text-sm font-medium mb-2">İşlem Sayısı Dağılımı</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {countData.map((entry, index) => (
                    <Cell key={`cell-count-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
