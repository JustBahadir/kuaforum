
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, X, Check, AlertTriangle } from 'lucide-react';
import { randevuServisi } from '@/lib/supabase/services/randevuServisi';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CustomerAppointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();
  
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['customerAppointments'],
    queryFn: async () => {
      if (!user) return [];
      try {
        // Use the new method to get user's appointments
        return await randevuServisi.kendiRandevulariniGetir();
      } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="flex justify-center my-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
    </div>;
  }
  
  // Filter appointments based on active tab and sort by date/time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.tarih);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (activeTab === 'upcoming') {
      return appointmentDate >= today && appointment.durum !== 'iptal';
    } else if (activeTab === 'past') {
      return appointmentDate < today || appointment.durum === 'tamamlandi';
    } else if (activeTab === 'canceled') {
      return appointment.durum === 'iptal';
    }
    return true;
  }).sort((a, b) => {
    // Sort by date first, then by time
    const dateA = new Date(a.tarih);
    const dateB = new Date(b.tarih);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If dates are the same, sort by time
    const timeA = a.saat.split(':');
    const timeB = b.saat.split(':');
    
    return (parseInt(timeA[0]) * 60 + parseInt(timeA[1])) - 
           (parseInt(timeB[0]) * 60 + parseInt(timeB[1]));
  });
  
  const handleCancelAppointment = async (appointmentId) => {
    try {
      await randevuServisi.durumGuncelle(appointmentId, 'iptal');
      toast.success('Randevunuz iptal edildi.');
      refetch();
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error('Randevu iptal edilemedi.');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'onaylandi':
        return <Badge className="bg-green-500">Onaylandı</Badge>;
      case 'iptal':
        return <Badge variant="destructive">İptal Edildi</Badge>;
      case 'tamamlandi':
        return <Badge className="bg-blue-500">Tamamlandı</Badge>;
      case 'beklemede':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Beklemede</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Randevularım</h1>
        <Button 
          onClick={() => window.location.href = '/dashboard/appointments/new'} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Yeni Randevu Al
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
              <TabsTrigger value="past">Geçmiş</TabsTrigger>
              <TabsTrigger value="canceled">İptal Edilen</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="upcoming" className="mt-0">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onCancel={() => handleCancelAppointment(appointment.id)}
                    allowCancel={true}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Yaklaşan randevunuz bulunmamaktadır." />
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onCancel={() => {}}
                    allowCancel={false}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Geçmiş randevunuz bulunmamaktadır." />
            )}
          </TabsContent>
          
          <TabsContent value="canceled" className="mt-0">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onCancel={() => {}}
                    allowCancel={false}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="İptal edilen randevunuz bulunmamaktadır." />
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentCard({ appointment, onCancel, allowCancel, getStatusBadge }) {
  const appointmentDate = new Date(appointment.tarih);
  const formattedDate = format(appointmentDate, 'd MMMM yyyy', { locale: tr });
  const isToday = new Date().toDateString() === appointmentDate.toDateString();
  
  // Check if the appointment is in the future and can be cancelled
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDay = new Date(appointment.tarih);
  appointmentDay.setHours(0, 0, 0, 0);
  const canCancel = allowCancel && appointmentDay >= today;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="bg-purple-50 p-4 flex flex-row md:flex-col items-center justify-center md:w-32 gap-3 md:gap-1">
          <Calendar className="h-5 w-5 text-purple-700" />
          <div className="text-center">
            <div className="font-medium">{isToday ? 'Bugün' : formattedDate}</div>
            <div className="text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 inline-block mr-1" />
              {appointment.saat.substring(0, 5)}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {appointment.personel?.ad_soyad || 'Personel'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {Array.isArray(appointment.islemler) && appointment.islemler.length > 0 
                  ? `${appointment.islemler.length} hizmet` 
                  : 'Hizmet detayı yok'}
              </p>
              <div className="mt-2">
                {getStatusBadge(appointment.durum)}
              </div>
            </div>
            
            {canCancel && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onCancel();
                }}
                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4 mr-1" /> İptal Et
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{message}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Yeni bir randevu oluşturmak için yukarıdaki butonu kullanabilirsiniz.
      </p>
    </div>
  );
}
