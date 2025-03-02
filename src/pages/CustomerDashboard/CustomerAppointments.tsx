
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { tr } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { Randevu } from "@/lib/supabase/types";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";

export default function CustomerAppointments() {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Function to load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await randevuServisi.kendiRandevulariniGetir();
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Randevularınız yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  // Load appointments on initial render
  useEffect(() => {
    loadAppointments();
  }, []);
  
  // Format date for display
  const formatAppointmentDate = (date: string) => {
    return format(parseISO(date), "d MMMM yyyy", { locale: tr });
  };
  
  // Format time for display
  const formatAppointmentTime = (time: string) => {
    return time.substring(0, 5);
  };
  
  // Get status text and color based on appointment status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "beklemede":
        return { text: "Beklemede", color: "bg-yellow-100 text-yellow-800" };
      case "onaylandi":
        return { text: "Onaylandı", color: "bg-green-100 text-green-800" };
      case "iptal_edildi":
        return { text: "İptal Edildi", color: "bg-red-100 text-red-800" };
      case "tamamlandi":
        return { text: "Tamamlandı", color: "bg-blue-100 text-blue-800" };
      default:
        return { text: "Bilinmiyor", color: "bg-gray-100 text-gray-800" };
    }
  };
  
  // Handle appointment creation success
  const handleAppointmentCreated = (appointment: Randevu) => {
    setAppointments(prev => [...prev, appointment]);
    setDialogOpen(false);
    toast.success("Randevunuz başarıyla oluşturuldu");
  };
  
  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDialogOpen(true);
    }
  };
  
  // Filter appointments for the selected day
  const appointmentsForSelectedDay = appointments.filter(appointment => {
    if (!date) return false;
    const appointmentDate = parseISO(appointment.tarih);
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    );
  });
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Randevularım</h1>
        <p className="text-gray-600 mt-1">Randevularınızı görüntüleyin ve yeni randevu oluşturun</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Takvim</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => day && setDate(day)}
              weekStartsOn={1} // Start week on Monday
              locale={tr}
              className="rounded-md border"
            />
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => handleDateSelect(date)}
            >
              Yeni Randevu Al
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {date ? formatAppointmentDate(date.toISOString()) : "Seçili Gün"} Randevuları
            </CardTitle>
            <CardDescription>
              {appointmentsForSelectedDay.length > 0 
                ? "Seçili gün için randevularınız" 
                : "Seçili gün için randevunuz bulunmuyor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentsForSelectedDay.length > 0 ? (
                appointmentsForSelectedDay.map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.durum);
                  return (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Saat: {formatAppointmentTime(appointment.saat)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.personel?.ad_soyad || "Personel atanmadı"}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      {appointment.notlar && (
                        <p className="mt-2 text-sm border-t pt-2">
                          <span className="font-medium">Not:</span> {appointment.notlar}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Seçili gün için randevunuz bulunmuyor
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Yeni Randevu</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Randevu Al</DialogTitle>
                  <DialogDescription>
                    Lütfen randevu detaylarını girin.
                  </DialogDescription>
                </DialogHeader>
                <AppointmentForm 
                  onAppointmentCreated={handleAppointmentCreated}
                  initialDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
                />
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tüm Randevularım</CardTitle>
          <CardDescription>
            {appointments.length > 0
              ? "Tüm randevularınızın listesi"
              : "Henüz randevu oluşturmadınız"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Randevular yükleniyor...</div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments
                .sort((a, b) => {
                  // Sort by date (latest first)
                  const dateA = new Date(`${a.tarih}T${a.saat}`);
                  const dateB = new Date(`${b.tarih}T${b.saat}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.durum);
                  return (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {formatAppointmentDate(appointment.tarih)} - {formatAppointmentTime(appointment.saat)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.personel?.ad_soyad || "Personel atanmadı"}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      {appointment.notlar && (
                        <p className="mt-2 text-sm border-t pt-2">
                          <span className="font-medium">Not:</span> {appointment.notlar}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Henüz randevunuz bulunmuyor. Yeni randevu almak için "Yeni Randevu Al" butonuna tıklayabilirsiniz.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
