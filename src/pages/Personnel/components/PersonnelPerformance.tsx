
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

export function PersonnelPerformance() {
  const { data: islemGecmisi = [], isLoading: islemlerLoading } = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: () => personelIslemleriServisi.hepsiniGetir()
  });

  const { data: personeller = [], isLoading: personellerLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  const performansVerileri = personeller?.map(personel => {
    const islemler = islemGecmisi.filter(i => i.personel_id === personel.id);
    const toplamCiro = islemler.reduce((sum, i) => sum + (i.tutar || 0), 0);
    const toplamPrim = islemler.reduce((sum, i) => sum + (i.odenen || 0), 0);
    const toplamPuan = islemler.reduce((sum, i) => sum + (i.puan || 0), 0);
    
    return {
      name: personel.ad_soyad,
      ciro: toplamCiro,
      islemSayisi: islemler.length,
      prim: toplamPrim,
      ortalamaPuan: islemler.length > 0 ? toplamPuan / islemler.length : 0
    };
  }).filter(item => item.islemSayisi > 0) || [];

  const isLoading = islemlerLoading || personellerLoading;
  const hasData = performansVerileri.length > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border">
        <p className="text-muted-foreground">Henüz yeterli performans verisi bulunmamaktadır.</p>
        <p className="text-sm text-muted-foreground mt-2">Tamamlanan randevular sonrasında personel performans verileri burada görüntülenecektir.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
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
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend formatter={(value: any) => value} />
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
              <Tooltip 
                formatter={(value: any, name: any) => {
                  if (name === 'ciro') return formatCurrency(Number(value));
                  if (name === 'prim') return formatCurrency(Number(value));
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="islemSayisi" name="İşlem Sayısı" fill="#0088FE" />
              <Bar dataKey="ortalamaPuan" name="Ortalama Puan" fill="#00C49F" />
              <Bar dataKey="prim" name="Toplam Prim" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
