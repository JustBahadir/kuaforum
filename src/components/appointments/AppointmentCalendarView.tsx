
import { format, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentItem } from "./AppointmentItem";
import { Loader2 } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";

interface AppointmentCalendarViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId: number | null;
  onCompleteClick: (appointment: Randevu) => void;
  onCancelClick: (appointment: Randevu) => void;
  onDateChange: (date: Date) => void;
}

export function AppointmentCalendarView({
  selectedDate,
  appointments,
  isLoading,
  currentPersonelId,
  onCompleteClick,
  onCancelClick,
  onDateChange,
}: AppointmentCalendarViewProps) {
  const selectedDayAppointments = appointments.filter(appointment => {
    if (!appointment.tarih) return false;
    const appointmentDate = new Date(appointment.tarih);
    return isSameDay(appointmentDate, selectedDate);
  }).sort((a, b) => {
    return a.saat.localeCompare(b.saat);
  });

  return (
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
              onSelect={(date) => date && onDateChange(date)}
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
                  <AppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                    currentPersonelId={currentPersonelId}
                    onCompleteClick={onCompleteClick}
                    onCancelClick={onCancelClick}
                  />
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
  );
}
