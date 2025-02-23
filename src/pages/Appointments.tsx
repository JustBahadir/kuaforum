
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Randevu, RandevuDurumu, randevuServisi, musteriServisi, personelServisi, islemServisi } from '@/lib/supabase';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';

export default function Appointments() {
  const [yeniRandevuAcik, setYeniRandevuAcik] = useState(false);
  const [seciliRandevu, setSeciliRandevu] = useState<Randevu | null>(null);
  const [silinecekRandevu, setSilinecekRandevu] = useState<Randevu | null>(null);

  const { data: randevular, isLoading: randevularYukleniyor, refetch: randevulariYenile } = useQuery({
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
      // Önce mevcut kullanıcıyı kontrol et
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Hata",
          description: "Randevu oluşturmak için giriş yapmanız gerekiyor.",
          variant: "destructive"
        });
        return;
      }

      // Randevu verisini hazırla
      const yeniRandevu = {
        ...randevuData,
        customer_id: user.id,
        durum: 'beklemede' as RandevuDurumu,
        notlar: '',
        islemler: [Number(randevuData.islem_id)]
      };

      await randevuServisi.ekle(yeniRandevu);
      await randevulariYenile(); // Randevu listesini güncelle
      
      toast({
        title: "Başarılı",
        description: "Randevu talebiniz alındı.",
      });
      
      setYeniRandevuAcik(false);
    } catch (error) {
      console.error('Randevu kaydedilirken hata:', error);
      toast({
        title: "Hata",
        description: "Randevu oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleRandevuSil = async (randevu: Randevu) => {
    try {
      await randevuServisi.sil(randevu.id);
      setSilinecekRandevu(null);
      await randevulariYenile();
      toast({
        title: "Başarılı",
        description: "Randevu silindi.",
      });
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
      toast({
        title: "Hata",
        description: "Randevu silinirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleRandevuEdit = (randevu: Randevu) => {
    setSeciliRandevu(randevu);
    setYeniRandevuAcik(true);
  };

  const handleStatusUpdate = async (id: number, durum: RandevuDurumu) => {
    try {
      await randevuServisi.guncelle(id, { durum });
      await randevulariYenile();
      toast({
        title: "Başarılı",
        description: "Randevu durumu güncellendi.",
      });
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata:', error);
      toast({
        title: "Hata",
        description: "Randevu durumu güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
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
            onEdit={handleRandevuEdit}
            onDelete={handleRandevuSil}
            onStatusUpdate={handleStatusUpdate}
            silinecekRandevu={silinecekRandevu}
            setSilinecekRandevu={setSilinecekRandevu}
          />
        ))}
      </div>
    </div>
  );
}
