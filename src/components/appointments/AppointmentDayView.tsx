
import { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, isYesterday, isToday, isTomorrow, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckSquare, XSquare, Info, Undo } from "lucide-react";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; 
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase/client";
import React from "react";

import { Calendar } from "@/components/ui/calendar";

interface AppointmentDayViewProps {
  selectedDate: Date;
  appointments: Randevu[];
  isLoading: boolean;
  isError?: boolean;
  error?: any;
  currentPersonelId?: number | null;
  onDateChange?: (date: Date) => void; // Made optional
  onUpdateStatus?: (id: number, status: RandevuDurumu) => Promise<any>; // Changed to onUpdateStatus
}

type AppointmentWithExtras = Randevu & {
  isReturnedFromCancel?: boolean;
};

export function AppointmentDayView({
  selectedDate,
  appointments,
  isLoading,
  isError,
  error,
  currentPersonelId,
  onDateChange,
  onUpdateStatus
}: AppointmentDayViewProps) {
  const [serviceNames, setServiceNames] = useState<Record<number, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  
  useEffect(() => {
    const fetchServiceNames = async () => {
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
    if (onDateChange) onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    if (onDateChange) onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    if (onDateChange) onDateChange(new Date());
  };

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

  // Helper methods to handle status updates
  const handleCompleteClick = (appointment: Randevu) => {
    if (onUpdateStatus) {
      onUpdateStatus(appointment.id, "tamamlandi");
    }
  };

  const handleCancelClick = (appointment: Randevu) => {
    if (onUpdateStatus) {
      onUpdateStatus(appointment.id, "iptal_edildi");
    }
  };

  const handleUndoCancelClick = (appointment: Randevu) => {
    if (onUpdateStatus) {
      onUpdateStatus(appointment.id, "onaylandi");
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = typeof appointment.tarih === 'string' 
      ? parseISO(appointment.tarih) 
      : new Date(appointment.tarih);
    return isSameDay(appointmentDate, selectedDate);
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return a.saat.localeCompare(b.saat);
  });

  const dayLabel = getDayLabel(selectedDate);

  const toggleCalendar = () => setShowCalendar(prev => !prev);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevDay} aria-label="Önceki Gün">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-2 items-center">
          <h2 className="text-xl font-semibold flex items-center">
            {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
            {dayLabel && <span className="ml-2 text-muted-foreground">({dayLabel})</span>}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Bugüne Git
          </Button>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleNextDay} aria-label="Sonraki Gün">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {showCalendar && (
        <div className="mb-4">
          <div className="p-3 pointer-events-auto border rounded-md max-w-sm bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date && onDateChange) {
                  onDateChange(date);
                  setShowCalendar(false);
                }
              }}
              locale={tr}
              initialFocus
              className="bg-white rounded-md"
            />
          </div>
        </div>
      )}

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
          {sortedAppointments.map((appointment) => {
            const appWithExtras = appointment as AppointmentWithExtras;
            const isReturnedFromCancel = appWithExtras.isReturnedFromCancel === true;
            const isUndoable = appointment.durum === "iptal_edildi";
            return (
              <Card key={appointment.id} 
                className={`overflow-hidden ${
                  isReturnedFromCancel ? "bg-[#FFE5E5]" : ""
                }`}
              >
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
                    
                    <div className="col-span-1 flex items-center justify-end flex-col sm:flex-row gap-2">
                      {appointment.durum === "onaylandi" && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-1" 
                            onClick={() => handleCompleteClick(appointment)}
                          >
                            <CheckSquare className="h-4 w-4" /> Tamamlandı
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex items-center gap-1" 
                            onClick={() => handleCancelClick(appointment)}
                          >
                            <XSquare className="h-4 w-4" /> İptal
                          </Button>
                        </div>
                      )}
                      
                      {appointment.durum === "tamamlandi" && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Tamamlandı
                          </Badge>
                          <CheckSquare className="text-green-600" />
                        </div>
                      )}
                      
                      {isUndoable && (
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            İptal Edildi
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => handleUndoCancelClick(appointment)}
                          >
                            <Undo className="h-4 w-4" /> Geri Al
                          </Button>
                          {isReturnedFromCancel && (
                            <>
                              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1 bg-pink-50 text-pink-600 border-pink-200 rounded-full px-2 py-[2px] select-none" >
                                🔁 İptalden Döndü
                              </Badge>
                              <CheckSquare className="text-green-600" />
                              <Button 
                                variant="ghost"
                                size="icon"
                                className="ml-1 text-blue-600 cursor-default"
                                aria-label="İptalden dönen randevu hakkında bilgi"
                                title="İptalden dönen randevu"
                                tabIndex={-1}
                                disabled
                              >
                                <Info className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
