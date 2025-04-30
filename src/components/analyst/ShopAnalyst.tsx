
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { randevuServisi } from '@/lib/supabase/services/randevuServisi';

export default function ShopAnalyst() {
  const [loading, setLoading] = useState(true);
  const [personelPerformans, setPersonelPerformans] = useState([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [monthlyAppointments, setMonthlyAppointments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Get current shop ID
        const shopId = await randevuServisi._getCurrentUserDukkanId();
        if (!shopId) {
          console.warn("No shop ID found, can't load analytics");
          return;
        }
        
        // Fetch personnel performance
        const { data: personelData } = await supabase
          .from('personel_performans')
          .select('*')
          .limit(10);
          
        if (personelData) {
          setPersonelPerformans(personelData);
        }
        
        // Fetch appointments grouped by status
        const appointments = await randevuServisi.dukkanRandevulariniGetir(shopId);
        
        if (appointments) {
          // Count appointments by status
          const statusCounts = appointments.reduce((acc, appointment) => {
            acc[appointment.durum] = (acc[appointment.durum] || 0) + 1;
            return acc;
          }, {});
          
          const statusData = Object.keys(statusCounts).map(status => ({
            name: status,
            count: statusCounts[status]
          }));
          
          setAppointmentsByStatus(statusData);
          setAppointmentCount(appointments.length);
          
          // Group appointments by month
          const today = new Date();
          const monthsData = [];
          
          for (let i = 5; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = month.toLocaleDateString('tr-TR', { month: 'short' });
            
            const count = appointments.filter(app => {
              const appDate = new Date(app.tarih);
              return appDate.getMonth() === month.getMonth() && 
                     appDate.getFullYear() === month.getFullYear();
            }).length;
            
            monthsData.push({
              name: monthName,
              count: count
            });
          }
          
          setMonthlyAppointments(monthsData);
        }
        
        // Count customers
        const { count: customerCountResult, error: customerCountError } = await supabase
          .from('musteriler')
          .select('*', { count: 'exact', head: true })
          .eq('dukkan_id', shopId);
          
        if (!customerCountError) {
          setCustomerCount(customerCountResult || 0);
        }
        
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Müşteri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Randevu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Personel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personelPerformans.length}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Appointments Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Aylık Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAppointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Randevu Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Appointment Status Breakdown */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Randevu Durumları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Adet" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
