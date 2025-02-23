
import React, { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock, Edit, Trash, Check, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Randevu, RandevuDurumu } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AppointmentCardProps {
  randevu: Randevu;
  onEdit: (randevu: Randevu) => void;
  onDelete: (randevu: Randevu) => void;
  onStatusUpdate: (id: number, durum: RandevuDurumu) => void;
  onCounterProposal: (id: number, date: string, time: string) => void;
  silinecekRandevu: Randevu | null;
  setSilinecekRandevu: (randevu: Randevu | null) => void;
}

export function AppointmentCard({
  randevu,
  onEdit,
  onDelete,
  onStatusUpdate,
  onCounterProposal,
  silinecekRandevu,
  setSilinecekRandevu
}: AppointmentCardProps) {
  const [counterProposalOpen, setCounterProposalOpen] = useState(false);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');

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

  const handleCounterProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCounterProposal(randevu.id, proposedDate, proposedTime);
    setCounterProposalOpen(false);
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
          {randevu.personel && (
            <span className="text-sm text-gray-500">
              Personel: {randevu.personel.ad_soyad}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm ${durumRengi(randevu.durum)}`}>
          {randevu.durum}
        </span>

        {randevu.counter_proposal_date && (
          <span className="text-sm text-blue-600">
            Önerilen: {format(new Date(randevu.counter_proposal_date), 'dd/MM/yyyy')} {randevu.counter_proposal_time}
          </span>
        )}
        
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
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-green-500"
              onClick={() => onStatusUpdate(randevu.id, 'onaylandi')}
            >
              <Check className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-red-500"
              onClick={() => onStatusUpdate(randevu.id, 'iptal_edildi')}
            >
              <X className="w-4 h-4" />
            </Button>

            <Dialog open={counterProposalOpen} onOpenChange={setCounterProposalOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-500"
                onClick={() => setCounterProposalOpen(true)}
              >
                <PlusCircle className="w-4 h-4" />
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alternatif Randevu Öner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCounterProposalSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tarih</Label>
                    <Input
                      id="date"
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Saat</Label>
                    <Input
                      id="time"
                      type="time"
                      value