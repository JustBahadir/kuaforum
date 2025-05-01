
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { Calendar, Check, Clock, User, Scissors, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { toast } from "sonner";

export interface AppointmentsListProps {
  onAddClick?: () => void;
  onSelectAppointment?: (appointment: Randevu) => void;
  hidemobile?: boolean;
  selectedDate?: Date;
}

export function AppointmentsList({ 
  onAddClick, 
  onSelectAppointment, 
  hidemobile = false,
  selectedDate = new Date()
}: AppointmentsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: async () => {
      try {
        console.log("Fetching appointments with randevuServisi.hepsiniGetir()");
        const data = await randevuServisi.hepsiniGetir();
        console.log("Appointments fetched:", data);
        return data;
      } catch (error) {
        console.error("Error in appointment fetch:", error);
        toast.error("Randevular yüklenirken bir hata oluştu.");
        return [];
      }
    },
  });

  // Apply status filter
  const filteredAppointments = appointments.filter((appointment: Randevu) => {
    // Filter by status
    if (statusFilter !== "all" && appointment.durum !== statusFilter) {
      return false;
    }
    
    // Filter by selected date
    const appointmentDate = new Date(appointment.tarih);
    const sDate = new Date(selectedDate);
    
    return (
      appointmentDate.getFullYear() === sDate.getFullYear() &&
      appointmentDate.getMonth() === sDate.getMonth() &&
      appointmentDate.getDate() === sDate.getDate()
    );
  });

  // Group appointments by time - only hours that have appointments
  const appointmentsByHour: Record<string, Randevu[]> = {};
  
  filteredAppointments.forEach(appointment => {
    const hour = appointment.saat.substring(0, 5);
    if (!appointmentsByHour[hour]) {
      appointmentsByHour[hour] = [];
    }
    appointmentsByHour[hour].push(appointment);
  });

  // Sort hours
  const sortedHours = Object.keys(appointmentsByHour).sort();

  const getStatusBadgeClass = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "onaylandi":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "iptal":
      case "iptal_edildi":
        return "bg-red-100 text-red-800 border-red-200";
      case "tamamlandi":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusCardClass = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede":
        return "border-l-yellow-500";
      case "onaylandi":
        return "border-l-blue-500";
      case "iptal":
      case "iptal_edildi":
        return "border-l-red-500";
      case "tamamlandi":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getStatusText = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede": return "Beklemede";
      case "onaylandi": return "Onaylandı";
      case "iptal": return "İptal Edildi";
      case "tamamlandi": return "Tamamlandı";
      case "iptal_edildi": return "İptal Edildi";
      default: return status;
    }
  };

  const handleStatusChange = async (id: number, status: RandevuDurumu) => {
    try {
      setIsUpdating(true);
      await randevuServisi.durumGuncelle(id, status);
      refetch();
      toast.success("Randevu durumu güncellendi.");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Durum güncellenirken bir hata oluştu.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={cn(hidemobile && "hidden md:block")}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl">
            {format(selectedDate, "d MMMM yyyy EEEE", { locale: tr })}
          </CardTitle>
          {onAddClick && (
            <Button onClick={onAddClick} size="sm">
              Yeni Randevu
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Hepsi
          </Button>
          <Button
            variant={statusFilter === "beklemede" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("beklemede")}
          >
            Beklemede
          </Button>
          <Button
            variant={statusFilter === "tamamlandi" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("tamamlandi")}
          >
            Tamamlandı
          </Button>
          <Button
            variant={statusFilter === "iptal" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("iptal")}
          >
            İptal
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : sortedHours.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Bu tarihte randevu bulunmuyor.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedHours.map(hour => (
              <div key={hour} className="space-y-2">
                <h3 className="text-lg font-semibold">{hour}</h3>
                
                <div className="space-y-2">
                  {appointmentsByHour[hour].map((appointment: Randevu) => (
                    <div 
                      key={appointment.id} 
                      className={cn(
                        "border-l-4 p-4 rounded-md bg-white shadow-sm hover:shadow transition-all",
                        getStatusCardClass(appointment.durum)
                      )}
                      onClick={() => onSelectAppointment && onSelectAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="font-medium">{appointment.musteri?.first_name} {appointment.musteri?.last_name || ''}</div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Scissors className="h-3.5 w-3.5" />
                            <span>
                              {appointment.personel?.ad_soyad || 'Belirtilmemiş'}
                            </span>
                          </div>
                          
                          <Badge className={cn("text-xs mt-2", getStatusBadgeClass(appointment.durum))}>
                            {getStatusText(appointment.durum)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {appointment.durum === "beklemede" && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(appointment.id, "onaylandi");
                                }}
                                disabled={isUpdating}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(appointment.id, "iptal");
                                }}
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {appointment.durum === "iptal" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(appointment.id, "beklemede");
                              }}
                              disabled={isUpdating}
                              className="text-xs"
                            >
                              Geri Al
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Toplam {filteredAppointments.length} randevu
        </div>
        {onAddClick && (
          <Button variant="outline" size="sm" onClick={onAddClick}>
            Yeni Randevu
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
