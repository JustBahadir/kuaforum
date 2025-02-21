
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { PersonelIslemi, Randevu, islemServisi, randevuServisi, personelIslemleriServisi } from "@/lib/supabase";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function BusinessReports() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const { data: randevular = [] } = useQuery({
    queryKey: ['randevular'],
    queryFn: randevuServisi.hepsiniGetir
  });

  const { data: personelIslemleri = [] } = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: () => personelIslemleriServisi.hepsiniGetir()
  });

  // Gelir raporu verileri
  const gelirVerileri = personelIslemleri.reduce((acc: any[], islem) => {
    const date = new Date(islem.created_at!);
    const key = timeRange === 'daily' ? date.toLocaleDateString() :
               timeRange === 'weekly' ? `Hafta ${Math.ceil(date.getDate() / 7)}` :
               `${date.getMonth() + 1}. Ay`;
    
    const existingEntry = acc.find(item => item.date === key);
    if (existingEntry) {
      existingEntry.gelir += islem.tutar;
    } else {
      acc.push({ date: key, gelir: islem.tutar });
    }
    return acc;
  }, []);

  // En popüler hizmetler
  const popularHizmetler = islemler.map(islem => ({
    name: islem.islem_adi,
    count: personelIslemleri.filter(pi => pi.islem_id === islem.id).length,
    gelir: personelIslemleri
      .filter(pi => pi.islem_id === islem.id)
      .reduce((sum, pi) => sum + pi.tutar, 0)
  })).sort((a, b) => b.count - a.count);

  // Randevu doluluk oranları
  const dolulukOrani = randevular.reduce((acc: any[], randevu) => {
    const date = new Date(randevu.tarih);
    const key = timeRange === 'daily' ? date.toLocaleDateString() :
               timeRange === 'weekly' ? `Hafta ${Math.ceil(date.getDate() / 7)}` :
               `${date.getMonth() + 1}. Ay`;
    
    const existingEntry = acc.find(item => item.date === key);
    if (existingEntry) {
      existingEntry.total++;
      if (randevu.durum === 'tamamlandi') existingEntry.completed++;
    } else {
      acc.push({
        date: key,
        total: 1,
        completed: randevu.durum === 'tamamlandi' ? 1 : 0
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    dolulukOrani: (item.completed / item.total) * 100
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">İş Raporları</h2>
        <Select value={timeRange} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zaman aralığı seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Günlük</SelectItem>
            <SelectItem value="weekly">Haftalık</SelectItem>
            <SelectItem value="monthly">Aylık</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gelir Raporu */}
        <Card>
          <CardHeader>
            <CardTitle>Gelir Raporu</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gelirVerileri}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gelir" stroke="#0088FE" name="Gelir (TL)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* En Popüler Hizmetler */}
        <Card>
          <CardHeader>
            <CardTitle>En Popüler Hizmetler</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={popularHizmetler.slice(0, 5)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {popularHizmetler.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Randevu Doluluk Oranları */}
        <Card>
          <CardHeader>
            <CardTitle>Randevu Doluluk Oranları</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dolulukOrani}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dolulukOrani" name="Doluluk Oranı (%)" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Personel Maliyet Analizi */}
        <Card>
          <CardHeader>
            <CardTitle>Personel Maliyet Analizi</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personelIslemleri}>
                <XAxis dataKey="personel_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tutar" name="Gelir" fill="#0088FE" />
                <Bar dataKey="odenen" name="Maliyet" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
