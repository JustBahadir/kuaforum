
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { randevuServisi } from "@/lib/supabase";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";
import { cn } from "@/lib/utils";
import { RandevuDurumu } from "@/lib/supabase/types";

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeStatus, setActiveStatus] = useState<"all" | RandevuDurumu>("all");
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  
  const {
    appointments,
    isLoading,
    refetch,
  } = useAppointments();

  const handleAppointmentStatusUpdate = async (id: number, status: RandevuDurumu) => {
    try {
      await randevuServisi.durumGuncelle(id, status);
      toast.success(`Randevu durumu "${status}" olarak güncellendi`);
      refetch();
    } catch (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      toast.error("Randevu durumu güncellenemedi");
    }
  };

  // Filter appointments by date and status
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.tarih);
    const today = new Date(selectedDate);
    
    // Filter by date
    if (appointmentDate.getDate() !== today.getDate() ||
        appointmentDate.getMonth() !== today.getMonth() ||
        appointmentDate.getFullYear() !== today.getFullYear()) {
      return false;
    }
    
    // Filter by status
    if (activeStatus !== "all" && appointment.durum !== activeStatus) {
      return false;
    }
    
    return true;
  });

  // Group appointments by time
  const appointmentsByTime: Record<string, any[]> = {};
  
  filteredAppointments.forEach(appointment => {
    const time = appointment.saat.substring(0, 5);
    if (!appointmentsByTime[time]) {
      appointmentsByTime[time] = [];
    }
    appointmentsByTime[time].push(appointment);
  });

  // Get sorted time slots
  const sortedTimeSlots = Object.keys(appointmentsByTime).sort();

  const getStatusColor = (status: RandevuDurumu) => {
    switch (status) {
      case 'tamamlandi': return 'bg-green-50 border-l-green-500';
      case 'beklemede': return 'bg-yellow-50 border-l-yellow-500';
      case 'onaylandi': return 'bg-blue-50 border-l-blue-500';
      case 'iptal':
      case 'iptal_edildi': return 'bg-red-50 border-l-red-500';
      default: return 'bg-gray-50 border-l-gray-500';
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Randevular</h1>
          <Button 
            onClick={() => setIsAppointmentDialogOpen(true)}
            className="gap-1.5"
          >
            Yeni Randevu
          </Button>
        </div>
        
        {/* Date and Status Filters */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <h2>Randevu Durumu</h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={activeStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveStatus("all")}
                    >
                      Hepsi
                    </Button>
                    <Button
                      variant={activeStatus === "beklemede" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveStatus("beklemede")}
                    >
                      Beklemede
                    </Button>
                    <Button
                      variant={activeStatus === "tamamlandi" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveStatus("tamamlandi")}
                    >
                      Tamamlandı
                    </Button>
                    <Button
                      variant={activeStatus === "iptal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveStatus("iptal")}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-auto justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "d MMMM yyyy", { locale: tr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setSelectedDate(date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        {/* Appointment List */}
        <div>
          <h2 className="text-lg font-medium mb-4">
            {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : sortedTimeSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Bu tarihte randevu bulunmuyor.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedTimeSlots.map(timeSlot => (
                <div key={timeSlot} className="space-y-2">
                  <h3 className="text-lg font-semibold">{timeSlot}</h3>
                  
                  <div className="space-y-2">
                    {appointmentsByTime[timeSlot].map((appointment) => (
                      <Card 
                        key={appointment.id} 
                        className={cn(
                          "border-l-4 p-4 overflow-hidden",
                          getStatusColor(appointment.durum)
                        )}
                      >
                        <CardContent className="p-0">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm font-medium">Müşteri</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Personel</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.personel?.ad_soyad || 'Atanmamış'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Hizmetler</p>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(appointment.islemler) && appointment.islemler.length > 0 
                                  ? `${appointment.islemler.length} hizmet` 
                                  : 'Hizmet detayı yok'}
                              </p>
                            </div>
                            <div className="flex justify-end">
                              {appointment.durum === "beklemede" && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 px-2 border-green-500 hover:bg-green-50"
                                    onClick={() => handleAppointmentStatusUpdate(appointment.id, "tamamlandi")}
                                  >
                                    Tamamlandı
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 px-2 border-red-500 hover:bg-red-50"
                                    onClick={() => handleAppointmentStatusUpdate(appointment.id, "iptal")}
                                  >
                                    İptal
                                  </Button>
                                </div>
                              )}
                              {(appointment.durum === "onaylandi" || appointment.durum === "iptal") && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAppointmentStatusUpdate(appointment.id, "beklemede")}
                                >
                                  Geri Al
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {appointment.notlar && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-sm text-muted-foreground">{appointment.notlar}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* New Appointment Dialog */}
        <NewAppointmentDialog
          open={isAppointmentDialogOpen}
          onOpenChange={setIsAppointmentDialogOpen}
          onSuccess={refetch}
        />
      </div>
    </StaffLayout>
  );
}
