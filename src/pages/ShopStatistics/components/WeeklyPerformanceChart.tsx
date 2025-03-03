
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyPerformanceChartProps {
  data: {
    name: string;
    ciro: number;
    musteri: number;
  }[];
}

export function WeeklyPerformanceChart({ data }: WeeklyPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Performans</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="ciro" stroke="#8884d8" activeDot={{ r: 8 }} name="Ciro (₺)" />
            <Line yAxisId="right" type="monotone" dataKey="musteri" stroke="#82ca9d" name="Müşteri Sayısı" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
