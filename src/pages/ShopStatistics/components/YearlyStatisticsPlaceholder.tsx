
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface YearlyStatisticsPlaceholderProps {
  data?: any[];
  isLoading: boolean;
}

export function YearlyStatisticsPlaceholder({ data, isLoading }: YearlyStatisticsPlaceholderProps) {
  const placeholderData = data && data.length > 0 ? data : [
    { name: 'Ocak', ciro: 0, islemSayisi: 0 },
    { name: 'Şubat', ciro: 0, islemSayisi: 0 },
    { name: 'Mart', ciro: 0, islemSayisi: 0 },
    { name: 'Nisan', ciro: 0, islemSayisi: 0 },
    { name: 'Mayıs', ciro: 0, islemSayisi: 0 },
    { name: 'Haziran', ciro: 0, islemSayisi: 0 },
    { name: 'Temmuz', ciro: 0, islemSayisi: 0 },
    { name: 'Ağustos', ciro: 0, islemSayisi: 0 },
    { name: 'Eylül', ciro: 0, islemSayisi: 0 },
    { name: 'Ekim', ciro: 0, islemSayisi: 0 },
    { name: 'Kasım', ciro: 0, islemSayisi: 0 },
    { name: 'Aralık', ciro: 0, islemSayisi: 0 },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yıllık Performans</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Yıllık Performans</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {(!data || data.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Alert variant="default" className="max-w-md">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Yıllık istatistikler için yeterli veri bulunmuyor. Daha sonra tekrar kontrol edin.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={placeholderData}
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
              <Tooltip formatter={(value: any) => {
                if (typeof value === 'number') {
                  return formatCurrency(value);
                }
                return value;
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="ciro" name="Ciro (TL)" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="islemSayisi" name="İşlem Sayısı" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
