
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, XSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Randevu, RandevuDurumu } from "@/lib/supabase/types";

interface AppointmentsListProps {
  appointments: Randevu[];
  isLoading: boolean;
  currentPersonelId?: number | null;
  onUpdateStatus: (id: number, status: RandevuDurumu) => Promise<any>;
}

export function AppointmentsList({
  appointments,
  isLoading,
  currentPersonelId,
  onUpdateStatus
}: AppointmentsListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: RandevuDurumu) => {
    switch (status) {
      case "beklemede":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
      case "onaylandi":
        return <Badge className="bg-blue-100 text-blue-800">Onaylandı</Badge>;
      case "iptal":
      case "iptal_edildi":
        return <Badge variant="destructive">İptal Edildi</Badge>;
      case "tamamlandi":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "d MMMM yyyy", { locale: tr });
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <p className="mt-2 text-muted-foreground">Randevular yükleniyor...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Randevu bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Saat</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.sort((a, b) => {
            // Sort by date (recent first) and then by time
            const dateA = new Date(`${a.tarih}T${a.saat}`);
            const dateB = new Date(`${b.tarih}T${b.saat}`);
            return dateB.getTime() - dateA.getTime();
          }).map((appointment) => (
            <TableRow 
              key={appointment.id} 
              className={expandedId === appointment.id ? "bg-muted/50" : ""}
            >
              <TableCell>{formatDate(appointment.tarih)}</TableCell>
              <TableCell>{appointment.saat.substring(0, 5)}</TableCell>
              <TableCell>
                {appointment.musteri ? 
                  `${appointment.musteri.first_name} ${appointment.musteri.last_name || ''}` : 
                  'Belirtilmemiş'
                }
              </TableCell>
              <TableCell>{appointment.personel?.ad_soyad || 'Atanmamış'}</TableCell>
              <TableCell>{getStatusBadge(appointment.durum)}</TableCell>
              <TableCell className="text-right space-x-2">
                {appointment.durum === "onaylandi" && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="ml-2"
                      onClick={() => onUpdateStatus(appointment.id, "tamamlandi")}
                    >
                      <CheckSquare className="h-4 w-4 mr-1" /> Tamamlandı
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="ml-2"
                      onClick={() => onUpdateStatus(appointment.id, "iptal_edildi")}
                    >
                      <XSquare className="h-4 w-4 mr-1" /> İptal
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="ml-2"
                  onClick={() => toggleExpand(appointment.id)}
                >
                  {expandedId === appointment.id ? "Gizle" : "Detaylar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
