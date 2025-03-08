
import { addDays, addWeeks, format, getDay, startOfWeek, subWeeks } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentWeekViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId?: number;
  onDateChange: (date: Date) => void;
}

export function AppointmentWeekView({
  selectedDate,
  appointments,
  isLoading,
  currentPersonelId,
  onDateChange
}: AppointmentWeekViewProps) {
  // Get the start of the week (Monday)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  
  // Generate an array of 7 days starting from Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  const handlePrevWeek = () => {
    onDateChange(subWeeks(selectedDate, 1));
  };
  
  const handleNextWeek = () => {
    onDateChange(addWeeks(selectedDate, 1));
  };
  
  const handleToday = () => {
    onDateChange(new Date());
  };
  
  // Function to get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(
      (appointment) => format(new Date(appointment.tarih), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).sort((a, b) => a.saat.localeCompare(b.saat));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-2 items-center">
          <h2 className="text-xl font-semibold">
            {format(weekStart, "d MMMM", { locale: tr })} - {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: tr })}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Bugün
          </Button>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <Card 
                key={day.toString()} 
                className={`h-full ${isToday ? 'border-primary' : ''}`}
              >
                <div className={`p-2 text-center border-b ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="font-semibold">
                    {format(day, "EEEE", { locale: tr })}
                  </div>
                  <div>
                    {format(day, "d MMM", { locale: tr })}
                  </div>
                </div>
                <CardContent className="p-2 h-[calc(100%-4rem)] overflow-auto">
                  {dayAppointments.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      Randevu yok
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className={`p-2 text-xs rounded ${
                            appointment.durum === "tamamlandi" ? "bg-green-100" : 
                            appointment.durum === "iptal_edildi" ? "bg-red-100" : 
                            "bg-blue-100"
                          }`}
                        >
                          <div className="font-medium">{appointment.saat}</div>
                          <div className="truncate">{appointment.musteri?.first_name} {appointment.musteri?.last_name}</div>
                          <div className="truncate text-[10px] text-muted-foreground">
                            {appointment.personel?.ad_soyad}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
