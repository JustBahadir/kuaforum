
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  ciro: number;
  islemSayisi: number;
}

interface MonthlyPerformanceChartProps {
  data: ChartDataItem[];
  isLoading: boolean;
}

export function MonthlyPerformanceChart({ data, isLoading }: MonthlyPerformanceChartProps) {
  
  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (data.length < 2) return { rate: 0, isIncrease: true };
    
    const lastMonth = data[data.length - 1].ciro;
    const previousMonth = data[data.length - 2].ciro;
    
    if (previousMonth === 0) return { rate: 100, isIncrease: true };
    
    const rate = ((lastMonth - previousMonth) / previousMonth) * 100;
    return {
      rate: Math.abs(rate),
      isIncrease: rate >= 0
    };
  };
  
  const growth = calculateGrowthRate();
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    if (name === 'ciro') {
      return [formatCurrency(value), 'Ciro'];
    }
    return [value, 'İşlem Sayısı'];
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aylık Gelir Trendi</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-col space-y-1 md:flex-row md:items-center md:justify-between md:space-y-0">
        <CardTitle className="text-lg">Aylık Gelir Trendi</CardTitle>
        <div className="flex flex-col items-end">
          <div className={`text-sm font-medium ${growth.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
            {growth.isIncrease ? '+' : '-'}{growth.rate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Son ay değişim</p>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCiro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIslem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="ciro" 
              name="Ciro (₺)" 
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorCiro)"
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="islemSayisi" 
              name="İşlem Sayısı" 
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorIslem)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
