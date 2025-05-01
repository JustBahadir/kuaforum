
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RandevuDurumu } from "@/lib/supabase/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppointmentsListProps {
  appointments: any[];
  loading: boolean;
  reload: () => void;
  statusFilter: RandevuDurumu | "all";
  setStatusFilter: (status: RandevuDurumu | "all") => void;
  defaultStatus: RandevuDurumu;
}

export function AppointmentsList({ 
  appointments = [], 
  loading,
  reload,
  statusFilter,
  setStatusFilter,
  defaultStatus = "beklemede"
}: AppointmentsListProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "beklemede":
        return "outline";
      case "onaylandi":
        return "default";
      case "iptal":
        return "destructive";
      case "tamamlandi":
        return "secondary"; // Changed from "success" to "secondary" to match valid Badge variants
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "beklemede":
        return "Beklemede";
      case "onaylandi":
        return "Onaylandı";
      case "iptal":
        return "İptal";
      case "tamamlandi":
        return "Tamamlandı";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-2 border-t-purple-600 border-purple-100 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Bu tarihte randevu bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">
                    {format(new Date(`${appointment.tarih}T${appointment.saat}`), "HH:mm", { locale: tr })}
                  </span>
                  <Badge variant={getStatusBadgeVariant(appointment.durum)}>
                    {getStatusLabel(appointment.durum)}
                  </Badge>
                </div>
                
                <div>
                  <p className="font-medium">
                    {appointment.musteri_adi || "İsimsiz Müşteri"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.hizmet_adi || "Belirtilmemiş"}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Button variant="outline" size="sm">
                  Detaylar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
