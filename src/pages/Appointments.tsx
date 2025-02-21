
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
  
  const [formData, setFormData] = useState({
    customer_id: '',
    personel_id: '',
    tarih: '',
    saat: '',
    durum: 'beklemede' as RandevuDurumu,
    notlar: '',
    islemler: [] as number[]
  });

  const { data: randevular, isLoading: randevularYukleniyor } = useQuery({
    queryKey: ['randevular'],
    queryFn: randevuServisi.hepsiniGetir
  });

  const { data: musteriler } = useQuery({
    queryKey: ['musteriler'],
    queryFn: musteriServisi.hepsiniGetir
  });

  const { data: personeller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir
  });

  const { data: islemler } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const formReset = () => {
    setFormData({
      customer_id: '',
      personel_id: '',
      tarih: '',
      saat: '',
      durum: 'beklemede',
      notlar: '',
      islemler: []
    });
    setSeciliRandevu(null);
  };

  const randevuKaydet = async () => {
    try {
      if (seciliRandevu) {
        await randevuServisi.guncelle(seciliRandevu.id, {
          ...formData,
          personel_id: Number(formData.personel_id)
        });
      } else {
        await randevuServisi.ekle({
          ...formData,
          personel_id: Number(formData.personel_id)
        });
      }
      setYeniRandevuAcik(false);
      formReset();
    } catch (error) {
      console.error('Randevu kaydedilirken hata:', error);
    }
  };

  const randevuSil = async (randevu: Randevu) => {
    try {
      await randevuServisi.sil(randevu.id);
      setSilinecekRandevu(null);
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
    }
  };

  const handleEdit = (randevu: Randevu) => {
    setSeciliRandevu(randevu);
    setFormData({
      customer_id: randevu.customer_id,
      personel_id: randevu.personel_id?.toString() || '',
      tarih: randevu.tarih,
      saat: randevu.saat,
      durum: randevu.durum,
      notlar: randevu.notlar || '',
      islemler: randevu.islemler
    });
    setYeniRandevuAcik(true);
  };

  const handleStatusUpdate = async (id: number, durum: RandevuDurumu) => {
    await randevuServisi.guncelle(id, { durum });
  };

  if (randevularYukleniyor) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Randevular</h1>
        <Dialog open={yeniRandevuAcik} onOpenChange={setYeniRandevuAcik}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                formReset();
                setYeniRandevuAcik(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Randevu
            </Button>
          </DialogTrigger>
          <AppointmentForm
            formData={formData}
            setFormData={setFormData}
            musteriler={musteriler || []}
            personeller={personeller || []}
            seciliRandevu={seciliRandevu}
            onSubmit={randevuKaydet}
            onCancel={() => setYeniRandevuAcik(false)}
          />
        </Dialog>
      </div>

      <div className="grid gap-4">
        {randevular?.map((randevu) => (
          <AppointmentCard
            key={randevu.id}
            randevu={randevu}
            onEdit={handleEdit}
            onDelete={randevuSil}
            onStatusUpdate={handleStatusUpdate}
            silinecekRandevu={silinecekRandevu}
            setSilinecekRandevu={setSilinecekRandevu}
          />
        ))}
      </div>
    </div>
  );
}
