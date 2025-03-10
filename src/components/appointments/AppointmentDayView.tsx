import { useState } from "react";
import { format, addDays, subDays, isSameDay, isYesterday, isToday, isTomorrow, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckSquare, XSquare, Eye } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

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
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
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
                <div className={`flex flex-col lg:flex-row lg:items-center border-l-4 ${
                  appointment.durum === "tamamlandi" ? "border-green-500" : 
                  appointment.durum === "iptal_edildi" ? "border-red-500" : 
                  "border-blue-500"
                } p-4`}>
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4">
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
                        {appointment.personel?.ad_soyad || "Atanmadı"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hizmetler</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(appointment.islemler) && appointment.islemler.map((islemId) => (
                          <Badge key={islemId} variant="outline" className="text-xs">
                            {serviceNames[islemId] || `İşlem ${islemId}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.notlar && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedNote(appointment.notlar || null);
                            setNoteDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Notu Görüntüle
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col sm:flex-row gap-2">
                    {appointment.durum === "onaylandi" && (
                      <>
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
                      </>
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

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Randevu Notu</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm">{selectedNote}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
