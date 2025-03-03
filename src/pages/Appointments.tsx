
import { useState, useEffect } from "react";
import { format, parse, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { Randevu } from "@/lib/supabase/types";
import { Loader2, Plus, Calendar as CalendarIcon } from "lucide-react";

export default function Appointments() {
  const { dukkanId } = useCustomerAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['dukkan-randevular', dukkanId],
    queryFn: async () => {
      if (dukkanId) {
        return randevuServisi.dukkanRandevulariniGetir(dukkanId);
      }
      return [];
    },
    enabled: !!dukkanId
  });
  
  // Seçili güne ait randevular
  const selectedDayAppointments = appointments.filter(appointment => {
    if (!appointment.tarih) return false;
    const appointmentDate = new Date(appointment.tarih);
    return isSameDay(appointmentDate, selectedDate);
  }).sort((a, b) => {
    // Saate göre sırala
    return a.saat.localeCompare(b.saat);
  });
  
  // Haftalık görünüm için gün aralığını hesapla
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Pazartesi başlangıç
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));
  
  // Randevu durumuna göre stil bilgisi
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'iptal_edildi':
        return 'bg-red-100 text-red-800';
      case 'tamamlandi':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Gün bloğunda gösterilecek randevu sayısı
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => {
      if (!appointment.tarih) return false;
      const appointmentDate = new Date(appointment.tarih);
      return isSameDay(appointmentDate, date);
    });
  };
  
  const handleAppointmentCreated = (appointment: Randevu) => {
    toast.success("Randevu başarıyla oluşturuldu");
    refetch();
    setAddDialogOpen(false);
  };
  
  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Randevular</h1>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Randevu
          </Button>
        </div>
        
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="day">Günlük Görünüm</TabsTrigger>
            <TabsTrigger value="week">Haftalık Görünüm</TabsTrigger>
            <TabsTrigger value="calendar">Takvim</TabsTrigger>
          </TabsList>
          
          <TabsContent value="day">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                    >
                      Önceki Gün
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Bugün
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    >
                      Sonraki Gün
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Randevular yükleniyor...</span>
                  </div>
                ) : selectedDayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex border p-4 rounded-lg">
                        <div className="w-20 text-center font-medium">
                          {appointment.saat.substring(0, 5)}
                        </div>
                        <div className="flex-1 border-l pl-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.personel?.ad_soyad || "Personel atanmadı"}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(appointment.durum)}`}>
                              {appointment.durum}
                            </span>
                          </div>
                          {appointment.islemler && appointment.islemler.length > 0 && (
                            <div className="mt-2 text-sm">
                              <p className="font-medium">İşlemler:</p>
                              <ul className="list-disc pl-5">
                                {appointment.islemler.map((islemId, index) => (
                                  <li key={index}>{islemId}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {appointment.notlar && (
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Not:</span> {appointment.notlar}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Bu gün için randevu bulunmuyor
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="week">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {format(startDate, 'd')} - {format(addDays(startDate, 6), 'd MMMM yyyy', { locale: tr })}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(addDays(startDate, -7))}
                    >
                      Önceki Hafta
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Bu Hafta
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(addDays(startDate, 7))}
                    >
                      Sonraki Hafta
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Randevular yükleniyor...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const dayAppointments = getAppointmentsForDay(day);
                      const isCurrentDay = isToday(day);
                      const isSelected = isSameDay(day, selectedDate);
                      
                      return (
                        <div 
                          key={day.toString()} 
                          className={`border rounded-lg overflow-hidden ${
                            isCurrentDay ? 'bg-blue-50 border-blue-200' : ''
                          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="p-2 bg-gray-100 text-center font-medium">
                            {format(day, 'EEEE', { locale: tr })}
                            <br />
                            {format(day, 'd MMM', { locale: tr })}
                          </div>
                          <div className="p-2 max-h-48 overflow-y-auto">
                            {dayAppointments.length > 0 ? (
                              dayAppointments.map((appointment) => (
                                <div 
                                  key={appointment.id} 
                                  className={`mb-1 p-1 text-xs rounded ${getStatusStyle(appointment.durum)}`}
                                >
                                  <p className="font-bold">{appointment.saat.substring(0, 5)}</p>
                                  <p>{appointment.musteri?.first_name} {appointment.musteri?.last_name}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-xs text-gray-500 py-2">
                                Randevu yok
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Takvim Görünümü</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border w-full"
                      locale={tr}
                    />
                  </div>
                  <div className="md:w-1/2">
                    <CardTitle className="mb-4">
                      {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                    </CardTitle>
                    
                    {isLoading ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Randevular yükleniyor...</span>
                      </div>
                    ) : selectedDayAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDayAppointments.map((appointment) => (
                          <div key={appointment.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium text-lg">
                                  {appointment.saat.substring(0, 5)} - {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {appointment.personel?.ad_soyad || "Personel atanmadı"}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(appointment.durum)}`}>
                                {appointment.durum}
                              </span>
                            </div>
                            {appointment.notlar && (
                              <p className="mt-2 text-sm">
                                <span className="font-medium">Not:</span> {appointment.notlar}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Bu gün için randevu bulunmuyor
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              onAppointmentCreated={handleAppointmentCreated}
              initialDate={format(selectedDate, 'yyyy-MM-dd')}
            />
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
