
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Randevu } from "@/lib/supabase/types";

interface AppointmentCalendarViewProps {
  appointments: Randevu[];
  isLoading: boolean;
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
}

export function AppointmentCalendarView({
  appointments,
  isLoading,
  selectedDate,
  onDateSelect
}: AppointmentCalendarViewProps) {
  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const dateKey = format(new Date(appointment.tarih), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, Randevu[]>);
  
  // Dates that have appointments
  const appointmentDates = Object.keys(appointmentsByDate).map(
    dateKey => new Date(dateKey)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{format(selectedDate, "MMMM yyyy", { locale: tr })}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row justify-center">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect?.(date)}
              className="border-0"
              locale={tr}
              month={selectedDate}
              modifiers={{
                appointment: appointmentDates,
              }}
              modifiersStyles={{
                appointment: { 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                },
                selected: {
                  backgroundColor: 'rgb(79, 70, 229)',
                  color: 'white'
                },
              }}
              disabled={{ before: new Date('2020-01-01') }}
            />
          </div>

          <div className="flex-1 md:max-w-md md:ml-4 mt-4 md:mt-0">
            <h3 className="font-medium text-base mb-3">{format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}</h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')] ? (
              <div className="space-y-3">
                {appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')].map((appointment) => (
                  <div key={appointment.id} className="p-3 border rounded-md bg-white">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          {appointment.saat && appointment.saat.substring(0, 5)}
                        </div>
                        <div className="text-base mt-1">
                          {appointment.musteri?.first_name} {appointment.musteri?.last_name || ''}
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="text-muted-foreground">
                          {appointment.personel?.ad_soyad || 'Belirtilmemiş'}
                        </div>
                        <div className={`mt-1 px-2 py-1 text-xs rounded-full inline-block
                          ${appointment.durum === 'tamamlandi' ? 'bg-green-100 text-green-800' :
                            appointment.durum === 'beklemede' ? 'bg-amber-100 text-amber-800' :
                            appointment.durum === 'iptal_edildi' || appointment.durum === 'iptal' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}`}
                        >
                          {appointment.durum === 'tamamlandi' ? 'Tamamlandı' :
                            appointment.durum === 'beklemede' ? 'Beklemede' :
                            appointment.durum === 'iptal_edildi' || appointment.durum === 'iptal' ? 'İptal' :
                            'Onaylandı'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Bu güne ait randevu bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
