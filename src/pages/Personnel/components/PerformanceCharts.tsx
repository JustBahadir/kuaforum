
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PersonelIslemi, Personel } from "@/lib/supabase";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface PerformanceChartsProps {
  personeller: Personel[];
  islemGecmisi: PersonelIslemi[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const performansVerileri = personeller.map(personel => {
    const islemler = islemGecmisi.filter(i => i.personel_id === personel.id);
    const toplamCiro = islemler.reduce((sum, i) => sum + (i.tutar || 0), 0);
    const toplamPuan = islemler.reduce((sum, i) => sum + (i.puan || 0), 0);
    
    return {
      name: personel.ad_soyad,
      ciro: toplamCiro,
      islemSayisi: islemler.length,
      toplamPuan: toplamPuan
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ciro Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performansVerileri}
                dataKey="ciro"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {performansVerileri.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personel Performans Karşılaştırması</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performansVerileri}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="islemSayisi" name="İşlem Sayısı" fill="#0088FE" />
              <Bar dataKey="toplamPuan" name="Toplam Puan" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
