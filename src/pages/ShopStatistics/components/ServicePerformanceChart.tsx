
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServicePerformanceChartProps {
  data: {
    name: string;
    count: number;
    revenue: number;
  }[];
}

export function ServicePerformanceChart({ data }: ServicePerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hizmet Performansı</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="İşlem Sayısı" />
            <Bar dataKey="revenue" fill="#82ca9d" name="Ciro (₺)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
