
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PersonelIslemi, Personel } from "@/lib/supabase/types";

interface PerformanceChartsProps {
  personeller: Personel[];
  islemGecmisi: PersonelIslemi[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  // Calculate performance metrics
  const performanceData = personeller.map(personel => {
    const personelIslemleri = islemGecmisi.filter(islem => islem.personel_id === personel.id);
    const islemSayisi = personelIslemleri.length;
    
    // Calculate total revenue and convert to number if necessary
    const toplamCiro = personelIslemleri.reduce((sum, islem) => {
      const tutar = typeof islem.tutar === 'string' ? parseFloat(islem.tutar) : islem.tutar;
      return sum + (isNaN(tutar) ? 0 : tutar);
    }, 0);
    
    // Calculate total points
    const toplamPuan = personelIslemleri.reduce((sum, islem) => sum + (islem.puan || 0), 0);
    
    // Calculate average points
    const ortalamaPuan = islemSayisi > 0 ? toplamPuan / islemSayisi : 0;

    return {
      name: personel.ad_soyad,
      islemSayisi,
      toplamCiro,
      ortalamaPuan,
      toplamPuan,
    };
  });

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ciro Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number | string) => {
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  return isNaN(numValue) ? '0.00 TL' : `${numValue.toFixed(2)} TL`;
                }}
              />
              <Legend />
              <Bar dataKey="toplamCiro" name="Toplam Ciro (TL)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personel Performans Karşılaştırması</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="islemSayisi" name="İşlem Sayısı" fill="#82ca9d" />
              <Bar yAxisId="right" dataKey="toplamPuan" name="Toplam Puan" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
