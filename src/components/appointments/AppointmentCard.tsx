
import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock, Edit, Trash, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Randevu, RandevuDurumu } from '@/lib/supabase';

interface AppointmentCardProps {
  randevu: Randevu;
  onEdit: (randevu: Randevu) => void;
  onDelete: (randevu: Randevu) => void;
  onStatusUpdate: (id: number, durum: RandevuDurumu) => void;
  silinecekRandevu: Randevu | null;
  setSilinecekRandevu: (randevu: Randevu | null) => void;
}

export function AppointmentCard({
  randevu,
  onEdit,
  onDelete,
  onStatusUpdate,
  silinecekRandevu,
  setSilinecekRandevu
}: AppointmentCardProps) {
  const durumRengi = (durum: RandevuDurumu) => {
    switch (durum) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'iptal_edildi':
        return 'bg-red-100 text-red-800';
      case 'tamamlandi':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="font-medium">
            {randevu.musteri?.first_name} {randevu.musteri?.last_name}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {format(new Date(randevu.tarih), 'dd MMMM yyyy', { locale: tr })}
            <Clock className="w-4 h-4 ml-2" />
            {randevu.saat}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm ${durumRengi(randevu.durum)}`}>
          {randevu.durum}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(randevu)}
        >
          <Edit className="w-4 h-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500"
              onClick={() => setSilinecekRandevu(randevu)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          {silinecekRandevu && silinecekRandevu.id === randevu.id && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Randevu Silme</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu randevuyu silmek istediğinizden emin misiniz?
                  Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSilinecekRandevu(null)}>
                  İptal
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDelete(silinecekRandevu)}
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>

        {randevu.durum === 'beklemede' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-green-500"
            onClick={() => onStatusUpdate(randevu.id, 'onaylandi')}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}

        {randevu.durum === 'beklemede' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={() => onStatusUpdate(randevu.id, 'iptal_edildi')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
