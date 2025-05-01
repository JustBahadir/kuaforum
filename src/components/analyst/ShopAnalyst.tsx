
// Fix the randevuServisi method name error
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { randevuServisi } from '@/lib/supabase/services/randevuServisi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ShopAnalyst() {
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fix the method name from _getCurrentUserDukkanId to getCurrentUserDukkanId
        const data = await randevuServisi.hepsiniGetir();
        setAppointmentsData(data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Group data by month for chart
  const getMonthlyData = () => {
    if (!appointmentsData || !appointmentsData.length) return [];

    const monthlyData: Record<string, { month: string, count: number }> = {};

    appointmentsData.forEach((appointment) => {
      const date = new Date(appointment.tarih);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: tr });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, count: 0 };
      }
      monthlyData[monthKey].count += 1;
    });

    return Object.values(monthlyData);
  };

  // Get status data for pie chart
  const getStatusData = () => {
    if (!appointmentsData || !appointmentsData.length) return [];

    const statusCount: Record<string, number> = {
      'beklemede': 0,
      'onaylandi': 0,
      'tamamlandi': 0,
      'iptal': 0
    };

    appointmentsData.forEach((appointment) => {
      if (statusCount[appointment.durum] !== undefined) {
        statusCount[appointment.durum] += 1;
      }
    });

    return Object.entries(statusCount).map(([name, value]) => ({
      name: getStatusName(name),
      value
    })).filter(item => item.value > 0);
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'beklemede': return 'Beklemede';
      case 'onaylandi': return 'Onaylandı';
      case 'tamamlandi': return 'Tamamlandı';
      case 'iptal': return 'İptal';
      default: return status;
    }
  };

  const monthlyData = getMonthlyData();
  const statusData = getStatusData();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Randevu Sayısı</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Randevu Sayısı" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">Henüz randevu bulunmamaktadır.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Randevu Durumları</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">Henüz randevu bulunmamaktadır.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
