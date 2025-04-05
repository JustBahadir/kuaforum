import { useQuery } from "@tanstack/react-query";
import { personelServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

export function PersonnelPerformanceReports() {
  const [reportType, setReportType] = useState<string>("general");
  const [timeRange, setTimeRange] = useState<string>("month");
  
  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });
  
  const { data: islemler = [] } = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: () => personelIslemleriServisi.hepsiniGetir()
  });

  // Calculate performance metrics
  const personnelPerformance = personeller.map(personel => {
    const personelIslemleri = islemler.filter(islem => islem.personel_id === personel.id);
    const totalRevenue = personelIslemleri.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
    const totalCommission = personelIslemleri.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
    const operationCount = personelIslemleri.length;
    const totalPoints = personelIslemleri.reduce((sum, islem) => sum + (islem.puan || 0), 0);
    
    return {
      id: personel.id,
      name: personel.ad_soyad,
      revenue: totalRevenue,
      commission: totalCommission,
      operationCount: operationCount,
      averageRevenue: operationCount > 0 ? totalRevenue / operationCount : 0,
      totalPoints: totalPoints
    };
  }).filter(p => p.operationCount > 0);
  
  // Customer count by personnel
  const customerCountByPersonnel = personeller.map(personel => {
    const personelIslemleri = islemler.filter(islem => islem.personel_id === personel.id);
    // Get unique customer IDs - safely access musteri_id which might not exist on all operations
    const uniqueCustomers = new Set();
    personelIslemleri.forEach(islem => {
      if (islem.musteri_id) {
        uniqueCustomers.add(islem.musteri_id);
      }
    });
    
    return {
      id: personel.id,
      name: personel.ad_soyad,
      customerCount: uniqueCustomers.size
    };
  }).filter(p => p.customerCount > 0);
  
  // Monthly performance data
  const monthlyPerformanceData = () => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const data = months.map(month => ({ month, revenue: 0 }));
    
    islemler.forEach(islem => {
      if (islem.created_at) {
        const date = new Date(islem.created_at);
        const monthIndex = date.getMonth();
        data[monthIndex].revenue += islem.tutar || 0;
      }
    });
    
    return data;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Rapor Türü</h3>
          <Select value={reportType} onValueChange={(value) => setReportType(value)}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Rapor türü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Genel Personeller Arası Performans</SelectItem>
              <SelectItem value="time">Tarih Arası Personel Performansı</SelectItem>
              <SelectItem value="customer">Müşteri Sayısı</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Zaman Aralığı</h3>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zaman aralığı seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Haftalık</SelectItem>
              <SelectItem value="month">Aylık</SelectItem>
              <SelectItem value="year">Yıllık</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {reportType === "general" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personel Ciro Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={personnelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Ciro" fill="#8884d8" />
                  <Bar dataKey="commission" name="Prim" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Personel İşlem Sayısı</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={personnelPerformance}
                    dataKey="operationCount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {personnelPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
      
      {reportType === "time" && (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Ciro Trendi</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPerformanceData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Ciro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {reportType === "customer" && (
        <Card>
          <CardHeader>
            <CardTitle>Personel Müşteri Sayısı</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerCountByPersonnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customerCount" name="Müşteri Sayısı" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
