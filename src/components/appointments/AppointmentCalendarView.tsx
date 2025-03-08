
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Randevu } from "@/lib/supabase/types";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentCalendarViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId?: number;
  onDateChange: (date: Date) => void;
  onCompleteClick: (appointment: Randevu) => void;
  onCancelClick: (appointment: Randevu) => void;
}

export function AppointmentCalendarView({
  selectedDate,
  appointments,
  isLoading,
  currentPersonelId,
  onDateChange,
  onCompleteClick,
  onCancelClick
}: AppointmentCalendarViewProps) {
  // Generate a map of dates with appointment counts
  const appointmentDates = appointments.reduce((acc, appointment) => {
    const date = format(new Date(appointment.tarih), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {} as Record<string, number>);
  
  // Get appointments for the selected date
  const dayAppointments = appointments.filter((appointment) => 
    isSameDay(new Date(appointment.tarih), selectedDate)
  ).sort((a, b) => a.saat.localeCompare(b.saat));
  
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
        ) : dayAppointments.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-md">
            <p className="text-muted-foreground">Bu tarih için randevu bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-semibold">{appointment.saat}</div>
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
                      <span className="text-muted-foreground">Müşteri:</span> {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Personel:</span> {appointment.personel?.ad_soyad}
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
                        onClick={() => onCompleteClick(appointment)}
                      >
                        Tamamlandı
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onCancelClick(appointment)}
                      >
                        İptal
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

function Button({ children, variant, size, onClick }: any) {
  const variantClasses = {
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    default: "bg-blue-600 text-white hover:bg-blue-700"
  };
  
  const sizeClasses = {
    sm: "py-1 px-2 text-xs",
    md: "py-2 px-4 text-sm"
  };
  
  return (
    <button
      className={`rounded font-medium transition-colors ${variantClasses[variant || "default"]} ${sizeClasses[size || "md"]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
