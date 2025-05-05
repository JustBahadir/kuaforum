
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { randevuServisi } from "@/lib/supabase";
import { Randevu, RandevuDurum } from "@/lib/supabase/types";

interface CustomerAppointmentsTableProps {
  musteriId: string;
  onRefresh: () => void;
}

export function CustomerAppointmentsTable({ musteriId, onRefresh }: CustomerAppointmentsTableProps) {
  const [loading, setLoading] = useState(false);
  const [randevular, setRandevular] = useState<Randevu[]>([]);
  
  useState(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const veri = await randevuServisi.musteriyeGoreGetir(musteriId);
        setRandevular(veri);
      } catch (error) {
        console.error("Randevular yüklenirken hata:", error);
        toast.error("Müşteri randevuları yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    
    if (musteriId) {
      loadAppointments();
    }
  });

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: tr });
    } catch (error) {
      return dateStr; // Return as is in case of error
    }
  };

  // Status badge
  const getStatusBadge = (status: RandevuDurum) => {
    switch (status) {
      case "planlandi":
        return <Badge className="bg-blue-500">Planlandı</Badge>;
      case "tamamlandi":
        return <Badge className="bg-green-500">Tamamlandı</Badge>;
      case "iptal":
        return <Badge className="bg-red-500">İptal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (randevuId: string, newStatus: RandevuDurum) => {
    try {
      const success = await randevuServisi.durumGuncelle(randevuId, newStatus);
      
      if (success) {
        toast.success(`Randevu durumu ${newStatus === "tamamlandi" ? "tamamlandı" : "iptal edildi"}`);
        onRefresh();
      } else {
        toast.error("Durum güncellenemedi");
      }
    } catch (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (randevular.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Bu müşteri için randevu kaydı bulunmuyor
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Saat</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead>İşlem</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">Aksiyonlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {randevular.map((randevu) => (
            <TableRow key={randevu.kimlik}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {formatDate(randevu.tarih)}
                </div>
              </TableCell>
              <TableCell>{randevu.saat}</TableCell>
              <TableCell>{randevu.personel_kimlik ? randevu.personel_kimlik : "-"}</TableCell>
              <TableCell>
                {randevu.hizmet_kimlik ? randevu.hizmet_kimlik : "-"}
              </TableCell>
              <TableCell>{getStatusBadge(randevu.durum)}</TableCell>
              <TableCell className="text-right">
                {randevu.durum === "planlandi" && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => updateAppointmentStatus(randevu.kimlik, "tamamlandi")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Tamamla
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => updateAppointmentStatus(randevu.kimlik, "iptal")}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> İptal
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CustomerAppointmentsTable;
