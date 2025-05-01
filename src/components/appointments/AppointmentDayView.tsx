import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, startOfWeek, addDays, endOfWeek, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";

export function AppointmentDayView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { dukkanId } = useCustomerAuth();
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [isHoursLoading, setIsHoursLoading] = useState(true);

  const { data: appointments = [], refetch: handleFetchAppointments } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const data = await randevuServisi.tarihGetir(formattedDate);
      return data;
    },
  });

  useEffect(() => {
    const fetchWorkingHours = async () => {
      if (!dukkanId) return;
      setIsHoursLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const dayOfWeek = format(selectedDate, 'eeee', { locale: tr }).toLowerCase();
        const hours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        const todaysHours = hours.find(h => h.gun.toLowerCase() === dayOfWeek);
        setWorkingHours(todaysHours);
      } catch (error) {
        console.error("Çalışma saatleri yüklenirken hata:", error);
        toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
      } finally {
        setIsHoursLoading(false);
      }
    };

    fetchWorkingHours();
  }, [selectedDate, dukkanId]);

  const handleStatusChange = async (id: number, newStatus: RandevuDurumu) => {
    try {
      setLoading(true);
      const result = await randevuServisi.durumGuncelle(id, newStatus);
      
      if (result) {
        await handleFetchAppointments(selectedDate);
        toast.success(`Randevu durumu güncellendi: ${getStatusText(newStatus)}`);
      } else {
        toast.error("Randevu durumu güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Randevu durumu güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: RandevuDurumu): string => {
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
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  // Create a timeline of appointments (grouped by hours)
  const timeSlots = useMemo(() => {
    if (!workingHours || isHoursLoading) {
      return [];
    }

    const startTime = workingHours.acilis ? parseInt(workingHours.acilis.split(':')[0]) : 9;
    const endTime = workingHours.kapanis ? parseInt(workingHours.kapanis.split(':')[0]) : 18;
    const interval = 30; // minutes

    const slots = [];
    let currentTime = startTime * 60; // Convert to minutes

    while (currentTime < endTime * 60) {
      const hour = Math.floor(currentTime / 60);
      const minute = currentTime % 60;
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push(time);
      currentTime += interval;
    }

    return slots;
  }, [appointments, workingHours, isHoursLoading, selectedDate]);

  const renderAppointment = (appointment: Randevu) => {
    const getStatusBadgeColor = (status: RandevuDurumu) => {
      switch (status) {
        case 'beklemede':
          return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'onaylandi':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'iptal':
        case 'iptal_edildi':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'tamamlandi':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="bg-white rounded-lg border shadow-sm p-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{appointment.musteri?.first_name} {appointment.musteri?.last_name || ''}</div>
            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeColor(appointment.durum)}`}>
              {getStatusText(appointment.durum)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Personel: {appointment.personel?.ad_soyad || 'Belirtilmemiş'}
          </div>
          {appointment.notlar && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Not: {appointment.notlar}
            </div>
          )}
          {appointment.durum !== 'tamamlandi' && appointment.durum !== 'iptal' && (
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleStatusChange(appointment.id, 'tamamlandi')}
              >
                Tamamlandı
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleStatusChange(appointment.id, 'iptal')}
              >
                İptal
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg font-semibold">
            {format(selectedDate, 'PPP', { locale: tr })}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="flex">
              <div className="w-24 flex-shrink-0 p-2">
                {timeSlots.map((time) => (
                  <div key={time} className="h-12 flex items-center justify-center border-b">
                    {time}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                {timeSlots.map((time) => {
                  const appointmentsForTime = appointments.filter(
                    (appointment) => appointment.saat.substring(0, 5) === time
                  );
                  return (
                    <div key={time} className="h-12 p-2 border-b">
                      {appointmentsForTime.map((appointment) => (
                        renderAppointment(appointment)
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
