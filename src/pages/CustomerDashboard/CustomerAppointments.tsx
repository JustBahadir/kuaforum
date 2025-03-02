
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Scissors, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          personel:personel(*),
          islemler
        `)
        .eq('customer_id', user.id)
        .order('tarih', { ascending: true });
        
      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error("Error in fetchAppointments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onaylandi':
        return <span className="flex items-center text-green-600"><CheckCircle className="mr-1 h-4 w-4" /> Onaylandı</span>;
      case 'iptal_edildi':
        return <span className="flex items-center text-red-600"><XCircle className="mr-1 h-4 w-4" /> İptal Edildi</span>;
      case 'tamamlandi':
        return <span className="flex items-center text-blue-600"><CheckCircle className="mr-1 h-4 w-4" /> Tamamlandı</span>;
      default:
        return <span className="flex items-center text-amber-600"><AlertCircle className="mr-1 h-4 w-4" /> Beklemede</span>;
    }
  };
  
  const filteredAppointments = selectedDate 
    ? appointments.filter(app => app.tarih === format(selectedDate, 'yyyy-MM-dd'))
    : appointments;
  
  const pendingAppointments = appointments.filter(app => app.durum === 'beklemede');
  const confirmedAppointments = appointments.filter(app => app.durum === 'onaylandi');
  const completedAppointments = appointments.filter(app => app.durum === 'tamamlandi');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Randevularınız yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Randevularım</h1>
        <p className="text-gray-600 mt-1">Tüm randevularınızı görüntüleyin ve yönetin</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tümü ({appointments.length})</TabsTrigger>
              <TabsTrigger value="pending">Bekleyen ({pendingAppointments.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Onaylanan ({confirmedAppointments.length})</TabsTrigger>
              <TabsTrigger value="completed">Tamamlanan ({completedAppointments.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <p className="mb-2">Henüz randevunuz bulunmuyor.</p>
                      <Link to="/appointments">
                        <Button>Yeni Randevu Oluştur</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Bekleyen randevunuz bulunmuyor.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="confirmed" className="space-y-4">
              {confirmedAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Onaylanmış randevunuz bulunmuyor.</p>
                  </CardContent>
                </Card>
              ) : (
                confirmedAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Tamamlanmış randevunuz bulunmuyor.</p>
                  </CardContent>
                </Card>
              ) : (
                completedAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Takvim</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border rounded-md"
                locale={tr}
              />
              {selectedDate && (
                <div className="mt-4">
                  <p className="font-medium">
                    {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {filteredAppointments.length} randevu
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/appointments" className="w-full">
                <Button className="w-full">Yeni Randevu Al</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: any }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'd MMMM yyyy', { locale: tr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };
  
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onaylandi':
        return <span className="flex items-center text-green-600"><CheckCircle className="mr-1 h-4 w-4" /> Onaylandı</span>;
      case 'iptal_edildi':
        return <span className="flex items-center text-red-600"><XCircle className="mr-1 h-4 w-4" /> İptal Edildi</span>;
      case 'tamamlandi':
        return <span className="flex items-center text-blue-600"><CheckCircle className="mr-1 h-4 w-4" /> Tamamlandı</span>;
      default:
        return <span className="flex items-center text-amber-600"><AlertCircle className="mr-1 h-4 w-4" /> Beklemede</span>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{formatDate(appointment.tarih)}</CardTitle>
          <div>
            {getStatusBadge(appointment.durum)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center">
              <Clock className="mr-2 h-4 w-4" /> Saat
            </p>
            <p>{formatTime(appointment.saat)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center">
              <User className="mr-2 h-4 w-4" /> Personel
            </p>
            <p>{appointment.personel?.ad_soyad || "Atanmadı"}</p>
          </div>
        </div>
        {appointment.notlar && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-500">Notlar</p>
            <p className="text-sm">{appointment.notlar}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 flex-col items-start">
        {appointment.durum === 'beklemede' && (
          <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-auto">
            Randevuyu İptal Et
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
