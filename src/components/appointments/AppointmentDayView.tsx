
import { useState } from "react";
import { format, addDays, subDays, isSameDay, isYesterday, isToday, isTomorrow, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckSquare, XSquare } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; 
import { Alert, AlertDescription } from "@/components/ui/alert";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface AppointmentDayViewProps {
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

export function AppointmentDayView({
  selectedDate,
  appointments,
  isLoading,
  isError,
  error,
  currentPersonelId,
  onDateChange,
  onCompleteClick,
  onCancelClick
}: AppointmentDayViewProps) {
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
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = typeof appointment.tarih === 'string' 
      ? parseISO(appointment.tarih) 
      : new Date(appointment.tarih);
    return isSameDay(appointmentDate, selectedDate);
  });

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
            Bugüne Git
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
      ) : isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Randevular yüklenirken bir hata oluştu: {error?.message || "Bilinmeyen hata"}
          </AlertDescription>
        </Alert>
      ) : sortedAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Bu tarih için randevu bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`grid grid-cols-1 md:grid-cols-5 border-l-4 ${
                  appointment.durum === "tamamlandi" ? "border-green-500" : 
                  appointment.durum === "iptal_edildi" ? "border-red-500" : 
                  "border-blue-500"
                } p-4`}>
                  <div className="col-span-4 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Saat</p>
                      <p className="font-medium">{appointment.saat.substring(0, 5)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Müşteri</p>
                      {appointment.musteri ? (
                        <p className="font-medium">
                          {appointment.musteri.first_name} {appointment.musteri.last_name}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Müşteri kaydı yok</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Personel</p>
                      <p className="font-medium">
                        {appointment.personel ? appointment.personel.ad_soyad : "Atanmamış"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hizmetler</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(appointment.islemler) && appointment.islemler.map((islemId, idx) => (
                          <Badge key={`${islemId}-${idx}`} variant="outline" className="text-xs">
                            {serviceNames[islemId] || `İşlem ${islemId}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-end">
                    {appointment.durum === "onaylandi" && (
                      <div className="flex flex-col sm:flex-row gap-2">
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
                    
                    {appointment.durum === "tamamlandi" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Tamamlandı
                      </Badge>
                    )}
                    
                    {appointment.durum === "iptal_edildi" && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        İptal Edildi
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
