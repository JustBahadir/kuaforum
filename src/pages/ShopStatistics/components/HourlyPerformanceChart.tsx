
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface HourlyPerformanceChartProps {
  data: any[];
  isLoading: boolean;
}

export function HourlyPerformanceChart({ data, isLoading }: HourlyPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saatlik Performans</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Filter out empty hours (no operations)
  const filteredData = data.filter(hour => hour.islemSayisi > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saatlik Performans</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Bu zaman diliminde işlem verisi bulunmuyor
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any) => {
                  if (typeof value === 'number' && value > 10) {
                    return formatCurrency(value);
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="ciro" 
                name="Ciro (TL)" 
                fill="#8884d8"
              />
              <Bar 
                yAxisId="right" 
                dataKey="islemSayisi" 
                name="İşlem Sayısı" 
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
