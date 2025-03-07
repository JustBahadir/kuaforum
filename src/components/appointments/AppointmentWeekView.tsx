
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface AppointmentWeekViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId: number | null;
  onDateChange: (date: Date) => void;
}

export function AppointmentWeekView({
  selectedDate,
  appointments,
  isLoading,
  currentPersonelId,
  onDateChange,
}: AppointmentWeekViewProps) {
  // Calculate start of the week (Monday)
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  // Generate array of days for the week
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));
  
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => {
      if (!appointment.tarih) return false;
      const appointmentDate = new Date(appointment.tarih);
      return isSameDay(appointmentDate, date);
    });
  };
  
  const getAppointmentCardStyle = (appointment: Randevu) => {
    if (currentPersonelId && appointment.personel_id === currentPersonelId) {
      return `mb-1 p-1 text-xs rounded border-2 border-purple-400 ${getStatusStyle(appointment.durum)} bg-opacity-70`;
    }
    return `mb-1 p-1 text-xs rounded ${getStatusStyle(appointment.durum)}`;
  };
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {format(startDate, 'd')} - {format(addDays(startDate, 6), 'd MMMM yyyy', { locale: tr })}
          </span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onDateChange(addDays(startDate, -7))}
            >
              Önceki Hafta
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDateChange(new Date())}
            >
              Bu Hafta
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDateChange(addDays(startDate, 7))}
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
                  className={cn(
                    "border rounded-lg overflow-hidden cursor-pointer",
                    isCurrentDay ? "bg-blue-50 border-blue-200" : "",
                    isSelected ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => onDateChange(day)}
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
                          className={getAppointmentCardStyle(appointment)}
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
  );
}
