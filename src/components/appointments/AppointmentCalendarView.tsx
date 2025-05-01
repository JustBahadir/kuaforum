import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isSameDay, subMonths, addMonths } from "date-fns";
import { tr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { toast } from "sonner";

export function AppointmentCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Randevu[]>([]);
  
  const { refetch: fetchAppointments } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () => randevuServisi.tariheGoreGetir(format(selectedDate, "yyyy-MM-dd")),
    onSuccess: (data) => {
      setAppointments(data || []);
    },
    refetchOnWindowFocus: false,
    enabled: false
  });
  
  const handleFetchAppointments = async (date: Date) => {
    setSelectedDate(date);
    await fetchAppointments();
  };

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

  const handleCancelAppointment = (id: number) => {
    handleStatusChange(id, "iptal");
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

  const goToPreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  useEffect(() => {
    handleFetchAppointments(selectedDate);
  }, []);

  const appointmentsByHour = useMemo(() => {
    // Group appointments by hour
    return appointments.reduce((acc, appointment) => {
      const hour = appointment.saat.substring(0, 2);
      
      if (!acc[hour]) {
        acc[hour] = [];
      }
      
      acc[hour].push(appointment);
      return acc;
    }, {} as Record<string, Randevu[]>);
  }, [appointments]);

  const renderStatusBadge = (status: RandevuDurumu) => {
    let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
    
    switch (status) {
      case "beklemede":
        badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
        break;
      case "onaylandi":
        badgeColor = "bg-green-100 text-green-800 border-green-200";
        break;
      case "iptal":
      case "iptal_edildi":
        badgeColor = "bg-red-100 text-red-800 border-red-200";
        break;
      case "tamamlandi":
        badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
        break;
      default:
        break;
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${badgeColor}`}>
        {getStatusText(status)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, "MMMM yyyy", { locale: tr })}
        </h2>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={goToPreviousMonth}>
            Önceki
          </Button>
          <Button size="sm" onClick={goToNextMonth}>
            Sonraki
          </Button>
        </div>
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleFetchAppointments}
        initialFocus
        locale={tr}
        className="rounded-md border"
      />
      
      <div className="mt-4">
        {Object.keys(appointmentsByHour).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(appointmentsByHour)
              .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
              .map(([hour, hourAppointments]) => (
                <div key={hour} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    {hour}:00
                  </h3>
                  <div className="space-y-2">
                    {hourAppointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-wrap gap-2 items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {appointment.musteri?.first_name}{' '}
                                  {appointment.musteri?.last_name || ''}
                                </span>
                                {renderStatusBadge(appointment.durum)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.saat.substring(0, 5)}
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Personel: </span>
                                <span>{appointment.personel?.ad_soyad || 'Belirtilmemiş'}</span>
                              </div>
                            </div>
                            
                            {appointment.durum !== "tamamlandi" && appointment.durum !== "iptal" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(appointment.id, "tamamlandi")}
                                  disabled={loading}
                                >
                                  Tamamlandı
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  disabled={loading}
                                >
                                  İptal Et
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Bu tarih için randevu bulunmamaktadır.
          </div>
        )}
      </div>
    </div>
  );
}
