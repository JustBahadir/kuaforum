
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { toast } from "sonner";

interface AppointmentDayViewProps {
  appointments: Randevu[];
  isLoading: boolean;
  selectedDate: Date;
  onAppointmentStatusUpdate: (id: number, status: string) => Promise<void>;
  onDateChange?: (date: Date) => void;
}

export function AppointmentDayView({
  appointments,
  isLoading,
  selectedDate,
  onAppointmentStatusUpdate,
  onDateChange
}: AppointmentDayViewProps) {
  const [filteredAppointments, setFilteredAppointments] = useState<Randevu[]>([]);
  
  // Sort and filter appointments based on selected date
  useEffect(() => {
    if (appointments && selectedDate) {
      const filtered = appointments
        .filter((appointment) => {
          const appointmentDate = new Date(appointment.tarih);
          return isSameDay(appointmentDate, selectedDate);
        })
        .sort((a, b) => {
          // Sort by time
          const timeA = a.saat.split(':');
          const timeB = b.saat.split(':');
          
          return (parseInt(timeA[0]) * 60 + parseInt(timeA[1])) - 
                (parseInt(timeB[0]) * 60 + parseInt(timeB[1]));
        });
      
      setFilteredAppointments(filtered);
    }
  }, [appointments, selectedDate]);

  const handlePreviousDay = () => {
    const prevDay = addDays(selectedDate, -1);
    if (onDateChange) {
      onDateChange(prevDay);
    }
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    if (onDateChange) {
      onDateChange(nextDay);
    }
  };

  // Helper function to determine card background color based on status
  const getStatusBackgroundColor = (status: RandevuDurumu) => {
    switch (status) {
      case "tamamlandi":
        return "bg-green-50 border-green-200";
      case "beklemede":
        return "bg-yellow-50 border-yellow-200";
      case "iptal":
      case "iptal_edildi":
        return "bg-red-50 border-red-200";
      case "onaylandi":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-white";
    }
  };

  const getStatusText = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede":
        return "Beklemede";
      case "onaylandi":
        return "Onaylandı";
      case "iptal":
        return "İptal Edildi";
      case "tamamlandi":
        return "Tamamlandı";
      case "iptal_edildi":
        return "İptal Edildi";
      default:
        return "Bilinmeyen";
    }
  };

  const getStatusBadgeColor = (status: RandevuDurumu) => {
    switch (status) {
      case 'beklemede':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'onaylandi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'iptal':
      case 'iptal_edildi':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'tamamlandi':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <CardTitle>{format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Bu güne ait randevu bulunmamaktadır.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={cn(
                    "border rounded-lg overflow-hidden",
                    getStatusBackgroundColor(appointment.durum as RandevuDurumu)
                  )}
                >
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-2 p-4 flex flex-col justify-center items-center bg-gray-50">
                      <div className="text-lg font-medium">
                        {appointment.saat.substring(0, 5)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeColor(appointment.durum as RandevuDurumu)}`}>
                        {getStatusText(appointment.durum as RandevuDurumu)}
                      </span>
                    </div>
                    
                    <div className="col-span-10 p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">
                            {appointment.musteri?.first_name} {appointment.musteri?.last_name || ''}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Personel: {appointment.personel?.ad_soyad || 'Belirtilmemiş'}
                          </div>
                          <div className="text-sm mt-2">
                            Hizmetler: {Array.isArray(appointment.islemler) && appointment.islemler.length > 0 
                              ? `${appointment.islemler.length} hizmet` 
                              : 'Hizmet detayı yok'}
                          </div>
                          {appointment.notlar && (
                            <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                              Not: {appointment.notlar}
                            </div>
                          )}
                        </div>
                        
                        {appointment.durum !== 'tamamlandi' && appointment.durum !== 'iptal' && appointment.durum !== 'iptal_edildi' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => onAppointmentStatusUpdate(appointment.id, 'tamamlandi')}
                            >
                              Tamamlandı
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => onAppointmentStatusUpdate(appointment.id, 'iptal_edildi')}
                            >
                              İptal
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
