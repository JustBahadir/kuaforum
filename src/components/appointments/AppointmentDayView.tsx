
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

interface AppointmentDayViewProps {
  appointments: any[];
  isLoading: boolean;
  selectedDate: Date;
  onAppointmentStatusUpdate: (id: number, status: string) => void;
}

export function AppointmentDayView({ 
  appointments, 
  isLoading, 
  selectedDate, 
  onAppointmentStatusUpdate
}: AppointmentDayViewProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // Fetch working hours for the selected day
  const { data: workingHours, isLoading: isLoadingHours, refetch } = useQuery({
    queryKey: ['workingHours', selectedDate],
    queryFn: async () => {
      try {
        const dayOfWeekNumber = selectedDate.getDay();
        // Convert Sunday (0) to 6 for our system (Monday=0, Sunday=6)
        const adjustedDayNumber = dayOfWeekNumber === 0 ? 6 : dayOfWeekNumber - 1;
        
        const dayNames = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];
        const dayName = dayNames[adjustedDayNumber];
        
        const allHours = await calismaSaatleriServisi.dukkanSaatleriGetir();
        return allHours.find(day => day.gun === dayName);
      } catch (error) {
        console.error('Error fetching working hours:', error);
        return null;
      }
    }
  });

  // We need to refetch working hours when the selected date changes
  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  // Generate time slots based on working hours
  useEffect(() => {
    if (workingHours && !workingHours.kapali) {
      const slots = [];
      const start = workingHours.acilis ? workingHours.acilis.substring(0, 5) : "09:00";
      const end = workingHours.kapanis ? workingHours.kapanis.substring(0, 5) : "19:00";
      
      // Parse hours and minutes
      let [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
      
      // Generate slots every 30 minutes
      while (
        startHour < endHour || 
        (startHour === endHour && startMinute <= endMinute)
      ) {
        slots.push(`${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`);
        
        // Increment by 30 minutes
        startMinute += 30;
        if (startMinute >= 60) {
          startHour += 1;
          startMinute -= 60;
        }
      }
      
      setTimeSlots(slots);
    } else {
      // Default slots if no working hours data
      const slots = [];
      for (let hour = 9; hour < 20; hour++) {
        for (let minute of [0, 30]) {
          slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      setTimeSlots(slots);
    }
  }, [workingHours]);

  const getAppointmentsForTimeSlot = (time: string) => {
    return appointments.filter(app => app.saat.startsWith(time));
  };

  // Status badge styles and text
  const getStatusBadge = (status: string) => {
    const statusInfo: Record<string, { class: string, text: string }> = {
      'beklemede': { class: 'bg-amber-100 text-amber-800 hover:bg-amber-200', text: 'Beklemede' },
      'onaylandi': { class: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Onaylandı' },
      'iptal': { class: 'bg-red-100 text-red-800 hover:bg-red-200', text: 'İptal Edildi' },
      'iptal_edildi': { class: 'bg-red-100 text-red-800 hover:bg-red-200', text: 'İptal Edildi' },
      'tamamlandi': { class: 'bg-blue-100 text-blue-800 hover:bg-blue-200', text: 'Tamamlandı' }
    };
    
    return statusInfo[status] || { class: 'bg-gray-100 text-gray-800', text: status };
  };

  if (isLoading || isLoadingHours) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (workingHours?.kapali) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-lg font-medium mb-2">İşyeri Kapalı</div>
          <p className="text-muted-foreground">Seçilen tarihte işyeri kapalıdır.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedDateString = format(selectedDate, 'EEEE, d MMMM yyyy', { locale: tr });
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-4 capitalize">{selectedDateString}</div>
        <ScrollArea className="h-[500px]">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-muted-foreground">Bu tarihe ait randevu bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(appointment => {
                const statusInfo = getStatusBadge(appointment.durum);
                let bgColor = "bg-white";
                
                if (appointment.durum === 'tamamlandi') {
                  bgColor = "bg-green-50";
                } else if (appointment.durum === 'beklemede') {
                  bgColor = "bg-amber-50"; 
                } else if (appointment.durum === 'iptal') {
                  bgColor = "bg-red-50";
                }
                
                return (
                  <div 
                    key={appointment.id} 
                    className={`p-4 rounded-lg border ${bgColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{appointment.saat}</span>
                        </div>
                        <div className="font-medium mt-2">
                          {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.personel?.ad_soyad || 'Personel atanmamış'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={statusInfo.class}>
                          {statusInfo.text}
                        </Badge>
                        
                        {appointment.durum === 'beklemede' && (
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onAppointmentStatusUpdate(appointment.id, 'onaylandi')}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onAppointmentStatusUpdate(appointment.id, 'iptal')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {appointment.notlar && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {appointment.notlar}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
