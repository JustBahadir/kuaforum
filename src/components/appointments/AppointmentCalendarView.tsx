
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Randevu } from "@/lib/supabase/types";
import { format, isSameDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, XSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase/client";

interface AppointmentCalendarViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  isError?: boolean;
  error?: any;
  currentPersonelId?: number;
  onDateChange: (date: Date) => void;
  onCompleteClick: (appointment: Randevu) => void;
  onCancelClick: (appointment: Randevu) => void;
}

export function AppointmentCalendarView({
  selectedDate,
  appointments,
  isLoading,
  isError,
  error,
  currentPersonelId,
  onDateChange,
  onCompleteClick,
  onCancelClick
}: AppointmentCalendarViewProps) {
  const [serviceNames, setServiceNames] = useState<Record<number, string>>({});
  
  // Get service names
  useEffect(() => {
    const fetchServiceNames = async () => {
      // Extract all service IDs from appointments
      const serviceIds = appointments
        .flatMap(appointment => 
          Array.isArray(appointment.islemler) ? appointment.islemler : [])
        .filter((id): id is number => typeof id === 'number');
        
      if (serviceIds.length === 0) return;
      
      try {
        const { data } = await supabase
          .from('islemler')
          .select('id, islem_adi')
          .in('id', [...new Set(serviceIds)]);
          
        if (data) {
          const serviceMap = data.reduce((acc, service) => {
            acc[service.id] = service.islem_adi;
            return acc;
          }, {} as Record<number, string>);
          
          setServiceNames(serviceMap);
        }
      } catch (error) {
        console.error("Error fetching service names:", error);
      }
    };
    
    fetchServiceNames();
  }, [appointments]);
  
  // Generate a map of dates with appointment counts
  const appointmentDates = appointments.reduce((acc, appointment) => {
    // Handle both Date objects and ISO strings
    const date = typeof appointment.tarih === 'string' 
      ? format(parseISO(appointment.tarih), "yyyy-MM-dd")
      : format(appointment.tarih, "yyyy-MM-dd");
      
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {} as Record<string, number>);
  
  // Get appointments for the selected date
  const dayAppointments = appointments.filter((appointment) => {
    const appointmentDate = typeof appointment.tarih === 'string' 
      ? parseISO(appointment.tarih) 
      : new Date(appointment.tarih);
    return isSameDay(appointmentDate, selectedDate);
  }).sort((a, b) => a.saat.localeCompare(b.saat));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          locale={tr}
          className="rounded-md border shadow p-3 pointer-events-auto"
          modifiers={{
            // Highlight days with appointments
            highlight: Object.keys(appointmentDates).map(dateStr => new Date(dateStr)),
          }}
          modifiersStyles={{
            highlight: { 
              fontWeight: 'bold',
              backgroundColor: 'var(--theme-primary)', 
              color: 'white'
            }
          }}
        />
      </div>
      
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
          </h3>
          {dayAppointments.length > 0 ? (
            <p>{dayAppointments.length} randevu</p>
          ) : (
            <p>Randevu yok</p>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Randevular yüklenirken bir hata oluştu: {error?.message || "Bilinmeyen hata"}
            </AlertDescription>
          </Alert>
        ) : dayAppointments.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-md">
            <p className="text-muted-foreground">Bu tarih için randevu bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {dayAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-semibold">{appointment.saat.substring(0, 5)}</div>
                    <Badge variant={
                      appointment.durum === "tamamlandi" ? "outline" : 
                      appointment.durum === "iptal_edildi" ? "destructive" : 
                      "default"
                    }>
                      {appointment.durum === "tamamlandi" ? "Tamamlandı" : 
                       appointment.durum === "iptal_edildi" ? "İptal Edildi" : 
                       "Onaylandı"}
                    </Badge>
                  </div>
                  
                  <div className="mt-2">
                    <div>
                      <span className="text-muted-foreground">Müşteri:</span> {
                        appointment.musteri 
                          ? `${appointment.musteri.first_name} ${appointment.musteri.last_name || ""}`
                          : "Belirtilmemiş"
                      }
                    </div>
                    <div>
                      <span className="text-muted-foreground">Personel:</span> {appointment.personel?.ad_soyad || "Belirtilmemiş"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hizmet:</span> {
                        Array.isArray(appointment.islemler) && appointment.islemler.length > 0
                          ? appointment.islemler.map(id => serviceNames[id] || `İşlem ${id}`).join(', ')
                          : "Belirtilmemiş"
                      }
                    </div>
                  </div>
                  
                  {appointment.notlar && (
                    <div className="mt-2 text-sm bg-muted p-2 rounded">
                      {appointment.notlar}
                    </div>
                  )}
                  
                  {appointment.durum === "onaylandi" && (
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => onCompleteClick(appointment)}
                      >
                        <CheckSquare className="h-4 w-4" /> Tamamlandı
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="flex items-center gap-1"
                        onClick={() => onCancelClick(appointment)}
                      >
                        <XSquare className="h-4 w-4" /> İptal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
