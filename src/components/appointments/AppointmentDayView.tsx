
import { useState } from "react";
import { format, addDays, subDays, isSameDay, isYesterday, isToday, isTomorrow } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentDayViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId?: number;
  onDateChange: (date: Date) => void;
  onCompleteClick: (appointment: Randevu) => void;
  onCancelClick: (appointment: Randevu) => void;
}

export function AppointmentDayView({
  selectedDate,
  appointments,
  isLoading,
  currentPersonelId,
  onDateChange,
  onCompleteClick,
  onCancelClick
}: AppointmentDayViewProps) {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Get the appropriate day label
  const getDayLabel = (date: Date) => {
    if (isToday(date)) {
      return "Bugün";
    } else if (isYesterday(date)) {
      return "Dün";
    } else if (isTomorrow(date)) {
      return "Yarın";
    }
    return "";
  };

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter(
    (appointment) => isSameDay(new Date(appointment.tarih), selectedDate)
  );

  // Sort by time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return a.saat.localeCompare(b.saat);
  });

  const dayLabel = getDayLabel(selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-2 items-center">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
            {dayLabel && <span className="ml-2 text-muted-foreground">({dayLabel})</span>}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Bugün
          </Button>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : sortedAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Bu tarih için randevu bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`flex flex-col lg:flex-row lg:items-center border-l-4 ${
                  appointment.durum === "tamamlandi" ? "border-green-500" : 
                  appointment.durum === "iptal_edildi" ? "border-red-500" : 
                  "border-blue-500"
                } p-4`}>
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Saat</p>
                      <p className="font-medium">{appointment.saat}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Müşteri</p>
                      <p className="font-medium">
                        {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hizmet</p>
                      <p className="font-medium">
                        {Array.isArray(appointment.islemler) && appointment.islemler.length > 0 
                          ? `${appointment.islemler.length} hizmet seçildi` 
                          : "Hizmet belirtilmemiş"}
                      </p>
                    </div>
                  </div>
                  
                  {appointment.durum === "onaylandi" && (
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
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
                  
                  {appointment.durum === "tamamlandi" && (
                    <div className="mt-4 lg:mt-0">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Tamamlandı
                      </span>
                    </div>
                  )}
                  
                  {appointment.durum === "iptal_edildi" && (
                    <div className="mt-4 lg:mt-0">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        İptal Edildi
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
