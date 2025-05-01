
// Fix the missing hepsiniGetir method error
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { personelIslemleriServisi } from '@/lib/supabase/services/personelIslemleriServisi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function PersonnelAnalyst({ personelId }: { personelId?: number }) {
  const [operationsData, setOperationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let data;
        if (personelId) {
          data = await personelIslemleriServisi.personelIslemleriGetir(personelId);
        } else {
          data = await personelIslemleriServisi.hepsiniGetir();
        }
        setOperationsData(data || []);
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [personelId]);

  // Group data by month for chart
  const getMonthlyData = () => {
    if (!operationsData || !operationsData.length) return [];

    const monthlyData: Record<string, { month: string, count: number }> = {};

    operationsData.forEach((op) => {
      const date = new Date(op.created_at);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: tr });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, count: 0 };
      }
      monthlyData[monthKey].count += 1;
    });

    return Object.values(monthlyData);
  };

  // Get services data for chart
  const getServicesData = () => {
    if (!operationsData || !operationsData.length) return [];

    const servicesCount: Record<string, number> = {};

    operationsData.forEach((op) => {
      const serviceName = op.aciklama || 'Unknown';

      if (!servicesCount[serviceName]) {
        servicesCount[serviceName] = 0;
      }
      servicesCount[serviceName] += 1;
    });

    return Object.entries(servicesCount).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const monthlyData = getMonthlyData();
  const servicesData = getServicesData();

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
          <CardTitle>Aylık İşlem Sayısı</CardTitle>
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
                  <Bar dataKey="count" name="İşlem Sayısı" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">Henüz veri bulunmamaktadır.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>En Çok Yapılan İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          {servicesData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={servicesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="İşlem Sayısı" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">Henüz veri bulunmamaktadır.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
