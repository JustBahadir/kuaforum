
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Randevu, RandevuDurumu } from '@/lib/supabase/types';
import { MoreHorizontal, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentsListProps {
  appointments: Randevu[];
  isLoading: boolean;
  onUpdateStatus: (id: number, status: RandevuDurumu) => Promise<Randevu | null>;
  currentPersonelId: number | null;
}

export function AppointmentsList({ 
  appointments, 
  isLoading, 
  onUpdateStatus,
  currentPersonelId
}: AppointmentsListProps) {
  
  const getStatusBadge = (status: RandevuDurumu) => {
    switch(status) {
      case 'beklemede':
      case 'onaylandi':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1"><Clock className="h-3 w-3" /> {status === 'beklemede' ? 'Beklemede' : 'Onaylandı'}</Badge>;
      case 'tamamlandi':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Tamamlandı</Badge>;
      case 'iptal_edildi':
      case 'iptal':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1"><XCircle className="h-3 w-3" /> İptal Edildi</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  const getRowClassName = (status: RandevuDurumu) => {
    switch(status) {
      case 'beklemede':
      case 'onaylandi':
        return 'bg-yellow-50';
      case 'tamamlandi':
        return 'bg-green-50';
      case 'iptal_edildi':
      case 'iptal':
        return 'bg-red-50';
      default:
        return '';
    }
  };

  const handleStatusChange = async (id: number, status: RandevuDurumu) => {
    try {
      await onUpdateStatus(id, status);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>;
  }

  if (appointments.length === 0) {
    return <div className="text-center p-8 text-gray-500">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium">Randevu bulunamadı</h3>
      <p className="mt-2">Seçilen tarih ve filtre için randevu bulunmamaktadır.</p>
    </div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih & Saat</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead>İşlemler</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => {
            // Combine date and time
            const appointmentDateTime = `${appointment.tarih}T${appointment.saat}`;
            const formattedDate = format(new Date(appointmentDateTime), 'dd MMMM yyyy', { locale: tr });
            const formattedTime = format(new Date(appointmentDateTime), 'HH:mm', { locale: tr });
            
            // Check if the current staff can manage this appointment
            const canManage = currentPersonelId === null || 
                             currentPersonelId === appointment.personel_id ||
                             appointment.personel_id === null;

            return (
              <TableRow key={appointment.id} className={getRowClassName(appointment.durum)}>
                <TableCell>
                  <div className="font-medium">{formattedDate}</div>
                  <div className="text-sm text-muted-foreground">{formattedTime}</div>
                </TableCell>
                <TableCell>
                  {appointment.musteri ? (
                    <div>
                      <div className="font-medium">{`${appointment.musteri.first_name} ${appointment.musteri.last_name || ''}`}</div>
                      <div className="text-sm text-muted-foreground">{appointment.musteri.phone || 'Telefon yok'}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Müşteri bilgisi yok</span>
                  )}
                </TableCell>
                <TableCell>
                  {appointment.personel ? (
                    appointment.personel.ad_soyad
                  ) : (
                    <span className="text-muted-foreground">Atanmamış</span>
                  )}
                </TableCell>
                <TableCell>
                  {Array.isArray(appointment.islemler) && appointment.islemler.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {appointment.islemler.map((islem: any, index: number) => (
                        <li key={index} className="text-sm">
                          {islem.islem_adi || 'İsimsiz işlem'}
                          {islem.fiyat && <span className="text-muted-foreground ml-1">({islem.fiyat} TL)</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">İşlem bilgisi yok</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(appointment.durum)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!canManage}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Menü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {appointment.durum !== 'tamamlandi' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(appointment.id, 'tamamlandi')}
                          className="text-green-700 focus:text-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          İşlemi Tamamla
                        </DropdownMenuItem>
                      )}
                      
                      {appointment.durum !== 'iptal_edildi' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(appointment.id, 'iptal_edildi')}
                          className="text-red-700 focus:text-red-700"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          İşlemi İptal Et
                        </DropdownMenuItem>
                      )}
                      
                      {appointment.durum === 'iptal_edildi' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(appointment.id, 'onaylandi')}
                          className="text-blue-700 focus:text-blue-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Randevuyu Yeniden Aktifleştir
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Detayları Görüntüle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
