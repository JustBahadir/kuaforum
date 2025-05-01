
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { useQuery } from "@tanstack/react-query";

export function CustomerAppointmentsTable({ customerId }: { customerId: number }) {
  // Get appointments for this customer
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [`customer-${customerId}-appointments`],
    queryFn: async () => {
      try {
        return await randevuServisi.kendiRandevulariniGetir();
      } catch (error) {
        console.error("Error fetching customer appointments:", error);
        return [];
      }
    }
  });

  const renderAppointmentStatus = (status: string) => {
    switch (status) {
      case "onaylandi":
        return <Badge className="bg-green-500">Onaylandı</Badge>;
      case "tamamlandi":
        return <Badge className="bg-blue-500">Tamamlandı</Badge>;
      case "iptal":
        return <Badge variant="destructive">İptal Edildi</Badge>;
      case "beklemede":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Beklemede</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };
  
  // Sort appointments by date (newest first)
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(b.tarih).getTime() - new Date(a.tarih).getTime();
  });

  if (!sortedAppointments.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Bu müşterinin randevusu bulunmamaktadır.
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
            <TableHead>Personel</TableHead>
            <TableHead>Hizmet(ler)</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{formatDate(appointment.tarih)}</TableCell>
              <TableCell>{appointment.saat.substring(0, 5)}</TableCell>
              <TableCell>{appointment.personel?.ad_soyad || "-"}</TableCell>
              <TableCell>
                {Array.isArray(appointment.islemler) && appointment.islemler.length
                  ? `${appointment.islemler.length} hizmet`
                  : "-"}
              </TableCell>
              <TableCell>{renderAppointmentStatus(appointment.durum)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
