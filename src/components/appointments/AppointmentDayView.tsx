
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentItem } from "./AppointmentItem";
import { Loader2 } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";

interface AppointmentDayViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId: number | null;
  onCompleteClick: (appointment: Randevu) => void;
  onCancelClick: (appointment: Randevu) => void;
  onDateChange: (date: Date) => void;
}

export function AppointmentDayView({
  selectedDate,
  appointments,
  isLoading,
  currentPersonelId,
  onCompleteClick,
  onCancelClick,
  onDateChange,
}: AppointmentDayViewProps) {
  const selectedDayAppointments = appointments.filter(appointment => {
    if (!appointment.tarih) return false;
    const appointmentDate = new Date(appointment.tarih);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => {
    return a.saat.localeCompare(b.saat);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
          </span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onDateChange(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
            >
              Önceki Gün
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDateChange(new Date())}
            >
              Bugün
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDateChange(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
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
      </CardContent>
    </Card>
  );
}
