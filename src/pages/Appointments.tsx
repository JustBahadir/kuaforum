
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Randevu, RandevuDurumu } from '@/lib/supabase';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

export default function Appointments() {
  const [yeniRandevuAcik, setYeniRandevuAcik] = useState(false);
  const [seciliRandevu, setSeciliRandevu] = useState<Randevu | null>(null);
  const [silinecekRandevu, setSilinecekRandevu] = useState<Randevu | null>(null);

  const { data: randevular, isLoading: randevularYukleniyor, refetch: randevulariYenile } = useQuery({
    queryKey: ['randevular'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:profiles(*),
          personel:personel(*)
        `)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: personeller } = useQuery({
    queryKey: ['personeller'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .order('ad_soyad');
      if (error) throw error;
      return data;
    }
  });

  const { data: islemler } = useQuery({
    queryKey: ['islemler'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .order('islem_adi');
      if (error) throw error;
      return data;
    }
  });

  const { data: kategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .order('sira');
      if (error) throw error;
      return data;
    }
  });

  const handleRandevuSubmit = async (randevuData: any) => {
    try {
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

      // Randevuyu kaydet
      const { data: randevu, error: randevuError } = await supabase
        .from('randevular')
        .insert([yeniRandevu])
        .select()
        .single();

      if (randevuError) throw randevuError;

      // Bildirim oluştur
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title: "Yeni Randevu Talebi",
          message: "Randevu talebiniz alınmıştır. Onay bekliyor.",
          type: "randevu_talebi",
          related_appointment_id: randevu.id
        }]);

      await randevulariYenile();
      
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
      await supabase
        .from('randevular')
        .delete()
        .eq('id', randevu.id);

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
      const { data: randevu } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('id', id)
        .select()
        .single();

      if (randevu) {
        // Bildirim oluştur
        await supabase
          .from('notifications')
          .insert([{
            user_id: randevu.customer_id,
            title: "Randevu Durumu Güncellendi",
            message: `Randevunuz ${durum} durumuna güncellendi.`,
            type: "randevu_guncelleme",
            related_appointment_id: randevu.id
          }]);
      }

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

  const handleCounterProposal = async (id: number, date: string, time: string) => {
    try {
      const { data: randevu } = await supabase
        .from('randevular')
        .update({
          counter_proposal_date: date,
          counter_proposal_time: time
        })
        .eq('id', id)
        .select()
        .single();

      if (randevu) {
        // Bildirim oluştur
        await supabase
          .from('notifications')
          .insert([{
            user_id: randevu.customer_id,
            title: "Alternatif Randevu Önerisi",
            message: `Size ${date} tarihinde saat ${time} için alternatif randevu önerildi.`,
            type: "randevu_onerisi",
            related_appointment_id: randevu.id
          }]);
      }

      await randevulariYenile();
      
      toast({
        title: "Başarılı",
        description: "Alternatif randevu önerisi gönderildi.",
      });
    } catch (error) {
      console.error('Alternatif randevu önerisi gönderilirken hata:', error);
      toast({
        title: "Hata",
        description: "Alternatif randevu önerisi gönderilirken bir hata oluştu.",
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
            kategoriler={kategoriler || []}
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
            onCounterProposal={handleCounterProposal}
            silinecekRandevu={silinecekRandevu}
            setSilinecekRandevu={setSilinecekRandevu}
          />
        ))}
      </div>
    </div>
  );
}
