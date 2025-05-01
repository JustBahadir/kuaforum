
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { randevuServisi } from '@/lib/supabase/services/randevuServisi';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerAppointmentsTableProps {
  customerId: number;
}

export function CustomerAppointmentsTable({ customerId }: CustomerAppointmentsTableProps) {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['customerAppointments', customerId],
    queryFn: async () => {
      try {
        return await randevuServisi.musteriRandevulari(customerId);
      } catch (error) {
        console.error("Error fetching customer appointments:", error);
        return [];
      }
    },
    enabled: !!customerId
  });

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'onaylandi':
        return <Badge className="bg-green-500">Onaylandı</Badge>;
      case 'beklemede':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Beklemede</Badge>;
      case 'iptal':
        return <Badge variant="destructive">İptal Edildi</Badge>;
      case 'tamamlandi':
        return <Badge className="bg-blue-500">Tamamlandı</Badge>;
      default:
        return <Badge variant="secondary">{durum}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return <p className="text-muted-foreground">Bu müşterinin randevu geçmişi bulunmuyor.</p>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Saat</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {format(new Date(appointment.tarih), "d MMMM yyyy", { locale: tr })}
              </TableCell>
              <TableCell>{appointment.saat.substring(0, 5)}</TableCell>
              <TableCell>{appointment.personel?.ad_soyad || "Belirsiz"}</TableCell>
              <TableCell>{getDurumBadge(appointment.durum)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
