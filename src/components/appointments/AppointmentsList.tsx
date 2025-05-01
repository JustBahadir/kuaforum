
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isToday, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { Calendar, Check, Clock, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

export interface AppointmentsListProps {
  onAddClick?: () => void;
  onSelectAppointment?: (appointment: Randevu) => void;
  hidemobile?: boolean;
}

export function AppointmentsList({ onAddClick, onSelectAppointment, hidemobile = false }: AppointmentsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const data = await randevuServisi.hepsiniGetir();
      return data;
    },
  });

  // Apply filters
  const filteredAppointments = appointments.filter((appointment: Randevu) => {
    const matchesSearch = searchTerm === "" || 
      (appointment.musteri?.first_name && appointment.musteri.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.musteri?.last_name && appointment.musteri.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.musteri?.phone && appointment.musteri.phone.includes(searchTerm));

    // Modified to exclude 'onaylandi' status
    const matchesStatus = statusFilter === "all" || appointment.durum === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort appointments by date and time (most recent first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.tarih}T${a.saat}`);
    const dateB = new Date(`${b.tarih}T${b.saat}`);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return isToday(dateTime) 
        ? `Bugün ${format(dateTime, 'HH:mm', { locale: tr })}`
        : format(dateTime, 'dd MMM, HH:mm', { locale: tr });
    } catch (error) {
      return "Geçersiz tarih";
    }
  };

  const getStatusBadgeClass = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "tamamlandi":
        return "bg-green-100 text-green-800 border-green-200";
      case "iptal":
      case "iptal_edildi":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede": return "Beklemede";
      case "tamamlandi": return "Tamamlandı";
      case "iptal": return "İptal Edildi";
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
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Randevular</span>
          {onAddClick && (
            <Button size="sm" onClick={onAddClick}>
              Yeni Randevu
            </Button>
          )}
        </CardTitle>
        <CardDescription>Tüm randevularınızı buradan yönetebilirsiniz.</CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="İsim veya telefon ara..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="iptal">İptal Edildi</SelectItem>
              <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="divide-y">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Görüntülenecek randevu bulunamadı.
            </div>
          ) : (
            sortedAppointments.map((appointment: Randevu) => (
              <div 
                key={appointment.id} 
                className={cn(
                  "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                  onSelectAppointment && "cursor-pointer"
                )}
                onClick={() => onSelectAppointment && onSelectAppointment(appointment)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="font-medium">{appointment.musteri?.first_name} {appointment.musteri?.last_name || ''}</div>
                    <div className="text-sm text-muted-foreground">{appointment.musteri?.phone && formatPhoneNumber(appointment.musteri.phone)}</div>
                    
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(parseISO(appointment.tarih), 'dd MMM yyyy', { locale: tr })}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {appointment.saat.substring(0, 5)}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="mr-1">Personel:</span>
                      {appointment.personel?.ad_soyad || 'Belirtilmemiş'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn("text-xs px-2 py-1 rounded-full border whitespace-nowrap", getStatusBadgeClass(appointment.durum))}>
                      {getStatusText(appointment.durum)}
                    </span>
                    
                    {appointment.durum === "beklemede" && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(appointment.id, "tamamlandi");
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
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      {sortedAppointments.length > 0 && (
        <CardFooter className="border-t p-4">
          <div className="text-sm text-muted-foreground">
            Toplam {sortedAppointments.length} randevu gösteriliyor
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
