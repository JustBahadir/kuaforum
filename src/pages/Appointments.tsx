
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Randevu, RandevuDurumu, randevuServisi, musteriServisi, personelServisi, islemServisi } from '@/lib/supabase';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';

export default function Appointments() {
  const [yeniRandevuAcik, setYeniRandevuAcik] = useState(false);
  const [seciliRandevu, setSeciliRandevu] = useState<Randevu | null>(null);
  const [silinecekRandevu, setSilinecekRandevu] = useState<Randevu | null>(null);

  const { data: randevular, isLoading: randevularYukleniyor } = useQuery({
    queryKey: ['randevular'],
    queryFn: randevuServisi.hepsiniGetir
  });

  const { data: personeller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir
  });

  const { data: islemler } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const handleRandevuSubmit = async (randevuData: any) => {
    try {
      await randevuServisi.ekle({
        ...randevuData,
        durum: 'beklemede' as RandevuDurumu,
        notlar: '',
        islemler: [Number(randevuData.islem_id)]
      });
      setYeniRandevuAcik(false);
    } catch (error) {
      console.error('Randevu kaydedilirken hata:', error);
    }
  };

  const handleRandevuSil = async (randevu: Randevu) => {
    try {
      await randevuServisi.sil(randevu.id);
      setSilinecekRandevu(null);
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Randevular</h1>
        <Dialog open={yeniRandevuAcik} onOpenChange={setYeniRandevuAcik}>
          <DialogTrigger asChild>
            <Button onClick={() => setYeniRandevuAcik(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Randevu
            </Button>
          </DialogTrigger>
          <AppointmentForm
            islemler={islemler || []}
            personeller={personeller || []}
            onSubmit={handleRandevuSubmit}
            onCancel={() => setYeniRandevuAcik(false)}
          />
        </Dialog>
      </div>

      <div className="grid gap-4">
        {randevular?.map((randevu) => (
          <AppointmentCard
            key={randevu.id}
            randevu={randevu}
            onDelete={handleRandevuSil}
            silinecekRandevu={silinecekRandevu}
            setSilinecekRandevu={setSilinecekRandevu}
          />
        ))}
      </div>
    </div>
  );
}
