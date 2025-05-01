
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/utils/currencyFormatter";

// Placeholder data for statistics
const monthlyData = [
  { name: 'Ocak', gelir: 12000, gider: 8000, kar: 4000 },
  { name: 'Şubat', gelir: 14000, gider: 9000, kar: 5000 },
  { name: 'Mart', gelir: 16000, gider: 10000, kar: 6000 },
  { name: 'Nisan', gelir: 18000, gider: 11000, kar: 7000 },
  { name: 'Mayıs', gelir: 20000, gider: 12000, kar: 8000 },
  { name: 'Haziran', gelir: 22000, gider: 13000, kar: 9000 },
];

const dailyData = [
  { name: 'Pazartesi', gelir: 2800, gider: 1800, kar: 1000 },
  { name: 'Salı', gelir: 3200, gider: 2000, kar: 1200 },
  { name: 'Çarşamba', gelir: 3600, gider: 2200, kar: 1400 },
  { name: 'Perşembe', gelir: 3000, gider: 1900, kar: 1100 },
  { name: 'Cuma', gelir: 4200, gider: 2500, kar: 1700 },
  { name: 'Cumartesi', gelir: 4800, gider: 2800, kar: 2000 },
  { name: 'Pazar', gelir: 2400, gider: 1600, kar: 800 },
];

const yearlyData = [
  { name: '2021', gelir: 140000, gider: 90000, kar: 50000 },
  { name: '2022', gelir: 180000, gider: 110000, kar: 70000 },
  { name: '2023', gelir: 220000, gider: 130000, kar: 90000 },
  { name: '2024', gelir: 260000, gider: 150000, kar: 110000 },
];

export function StatisticsData() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <CardDescription>Bu ay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(20000)}</div>
            <p className="text-xs text-muted-foreground">
              +15% geçen aya göre
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <CardDescription>Bu ay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(12000)}</div>
            <p className="text-xs text-muted-foreground">
              +10% geçen aya göre
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kar</CardTitle>
            <CardDescription>Bu ay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(8000)}</div>
            <p className="text-xs text-muted-foreground">
              +20% geçen aya göre
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="day">Günlük</TabsTrigger>
          <TabsTrigger value="month">Aylık</TabsTrigger>
          <TabsTrigger value="year">Yıllık</TabsTrigger>
        </TabsList>
        
        <TabsContent value="day" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Günlük İstatistikler</CardTitle>
              <CardDescription>Son 7 günün gelir ve gider grafiği</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="gelir" name="Gelir" fill="#16a34a" />
                    <Bar dataKey="gider" name="Gider" fill="#ef4444" />
                    <Bar dataKey="kar" name="Kar" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="month" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aylık İstatistikler</CardTitle>
              <CardDescription>Son 6 ayın gelir ve gider grafiği</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="gelir" name="Gelir" fill="#16a34a" />
                    <Bar dataKey="gider" name="Gider" fill="#ef4444" />
                    <Bar dataKey="kar" name="Kar" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="year" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Yıllık İstatistikler</CardTitle>
              <CardDescription>Son 4 yılın gelir ve gider grafiği</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="gelir" name="Gelir" fill="#16a34a" />
                    <Bar dataKey="gider" name="Gider" fill="#ef4444" />
                    <Bar dataKey="kar" name="Kar" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
