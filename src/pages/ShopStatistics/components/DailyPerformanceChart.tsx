
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DailyData {
  name: string;
  ciro: number;
  musteri: number;
  saat?: string;
}

interface DailyPerformanceChartProps {
  data: DailyData[];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    ciro: Number(item.ciro)
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Günlük Ciro ve İşlem Sayısı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="saat" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number) => {
                  if (typeof value === 'number') {
                    return formatCurrency(value);
                  }
                  return value;
                }}
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="ciro" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Ciro (₺)" 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="musteri" 
                stroke="#82ca9d" 
                name="İşlem Sayısı" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saatlik Dağılım</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="saat" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => {
                  if (typeof value === 'number' && value !== 0) {
                    return formatCurrency(value);
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="musteri" name="İşlem Sayısı" fill="#8884d8" />
              <Bar dataKey="ciro" name="Ciro (₺)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
