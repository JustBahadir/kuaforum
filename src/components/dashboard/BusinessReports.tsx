
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { islemServisi, randevuServisi, personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function BusinessReports() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: async () => islemServisi.hepsiniGetir()
  });

  const { data: randevular = [] } = useQuery({
    queryKey: ['randevular'],
    queryFn: async () => randevuServisi.hepsiniGetir()
  });

  const { data: personelIslemleri = [] } = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: async () => {
      const result = await personelIslemleriServisi.hepsiniGetir();
      console.log("Retrieved all personnel operations for reports:", result);
      return result;
    }
  });

  // Filter operations by date range
  const filterOperationsByTimeRange = () => {
    const now = new Date();
    const filtered = personelIslemleri.filter(islem => {
      if (!islem.created_at) return false;
      
      const date = new Date(islem.created_at);
      
      if (timeRange === 'daily') {
        // Current day
        return date.getDate() === now.getDate() && 
               date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      } else if (timeRange === 'weekly') {
        // Current week (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return date >= sevenDaysAgo;
      } else {
        // Current month
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      }
    });
    
    return filtered;
  };

  const filteredOperations = filterOperationsByTimeRange();

  // Gelir raporu verileri
  const gelirVerileri = (() => {
    // Group by date according to time range
    const grouped = filteredOperations.reduce((acc: any[], islem) => {
      if (!islem.created_at) return acc;
      
      const date = new Date(islem.created_at);
      let key;
      
      if (timeRange === 'daily') {
        // Group by hour
        key = `${date.getHours()}:00`;
      } else if (timeRange === 'weekly') {
        // Group by day of week
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        key = days[date.getDay()];
      } else {
        // Group by day of month
        key = date.getDate().toString();
      }
      
      const existingEntry = acc.find(item => item.date === key);
      if (existingEntry) {
        existingEntry.gelir += islem.tutar || 0;
      } else {
        acc.push({ date: key, gelir: islem.tutar || 0 });
      }
      return acc;
    }, []);
    
    // Sort by date
    if (timeRange === 'daily') {
      // Sort by hour
      return grouped.sort((a, b) => parseInt(a.date) - parseInt(b.date));
    } else if (timeRange === 'weekly') {
      // Sort by day of week
      const dayOrder = { 'Pazartesi': 0, 'Salı': 1, 'Çarşamba': 2, 'Perşembe': 3, 'Cuma': 4, 'Cumartesi': 5, 'Pazar': 6 };
      return grouped.sort((a, b) => dayOrder[a.date as keyof typeof dayOrder] - dayOrder[b.date as keyof typeof dayOrder]);
    } else {
      // Sort by day of month
      return grouped.sort((a, b) => parseInt(a.date) - parseInt(b.date));
    }
  })();

  // En popüler hizmetler
  const popularHizmetler = islemler.map(islem => {
    const islemOperations = filteredOperations.filter(op => op.islem_id === islem.id);
    return {
      name: islem.islem_adi,
      count: islemOperations.length,
      gelir: islemOperations.reduce((sum, op) => sum + (op.tutar || 0), 0)
    };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  // Randevu doluluk oranları
  const dolulukOrani = (() => {
    // Filter appointments by date range
    const filteredAppointments = randevular.filter(randevu => {
      const date = new Date(randevu.tarih);
      
      if (timeRange === 'daily') {
        // Current day
        const now = new Date();
        return date.getDate() === now.getDate() && 
               date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      } else if (timeRange === 'weekly') {
        // Current week (last 7 days)
        const sevenDaysAgo = new Date();
        const now = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return date >= sevenDaysAgo && date <= now;
      } else {
        // Current month
        const now = new Date();
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      }
    });
    
    // Group by date according to time range
    return filteredAppointments.reduce((acc: any[], randevu) => {
      const date = new Date(randevu.tarih);
      let key;
      
      if (timeRange === 'daily') {
        // Group by hour
        key = `${randevu.saat.split(':')[0]}:00`;
      } else if (timeRange === 'weekly') {
        // Group by day of week
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        key = days[date.getDay()];
      } else {
        // Group by day of month
        key = date.getDate().toString();
      }
      
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
      dolulukOrani: item.total > 0 ? (item.completed / item.total) * 100 : 0
    }));
  })();

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
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
                  {popularHizmetler.slice(0, 5).map((entry, index) => (
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
            {filteredOperations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredOperations}>
                  <XAxis dataKey="personel_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tutar" name="Gelir" fill="#0088FE" />
                  <Bar dataKey="odenen" name="Maliyet" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Seçilen zaman aralığında veri bulunamadı
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
