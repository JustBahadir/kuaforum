import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Scissors, Sparkles } from 'lucide-react';
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

      const yeniRandevu = {
        ...randevuData,
        customer_id: user.id,
        durum: 'beklemede' as RandevuDurumu,
        notlar: '',
        islemler: [Number(randevuData.islem_id)]
      };

      const { data: randevu, error: randevuError } = await supabase
        .from('randevular')
        .insert([yeniRandevu])
        .select()
        .single();

      if (randevuError) throw randevuError;

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

  const hairstyles = [
    {
      id: 1,
      title: "Modern Kesim",
      description: "Yüz şeklinize uygun modern saç kesimi",
      image: "/public/lovable-uploads/3a32ddb1-9910-4566-9427-c53fddc3a8c8.png",
      color: "bg-[#D946EF]"
    },
    {
      id: 2,
      title: "Renklendirme",
      description: "Profesyonel saç boyama hizmetleri",
      image: "/public/lovable-uploads/3a32ddb1-9910-4566-9427-c53fddc3a8c8.png",
      color: "bg-[#8B5CF6]"
    },
    {
      id: 3,
      title: "Saç Bakımı",
      description: "Saç sağlığını koruyucu bakım uygulamaları",
      image: "/public/lovable-uploads/3a32ddb1-9910-4566-9427-c53fddc3a8c8.png",
      color: "bg-[#F97316]"
    },
    {
      id: 4,
      title: "Özel Tasarım",
      description: "Özel günleriniz için saç tasarımları",
      image: "/public/lovable-uploads/3a32ddb1-9910-4566-9427-c53fddc3a8c8.png",
      color: "bg-[#0EA5E9]"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Randevular</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {hairstyles.map((style) => (
          <div key={style.id} className="relative overflow-hidden rounded-xl shadow-lg group">
            <div className={`absolute inset-0 ${style.color} opacity-80 z-10`}></div>
            <img 
              src={style.image} 
              alt={style.title} 
              className="w-full h-64 object-cover object-center transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-white z-20 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-xl font-bold">{style.title}</h3>
              <p className="text-sm opacity-90">{style.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mb-10">
        <Dialog open={yeniRandevuAcik} onOpenChange={setYeniRandevuAcik}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setYeniRandevuAcik(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Yeni Randevu</span>
                <Scissors className="h-5 w-5 ml-1" />
              </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 bg-secondary/50 p-6 rounded-xl">
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Profesyonel Ekip</h3>
          <p className="text-sm text-muted-foreground">Alanında uzman stilistlerle mükemmel sonuçlar</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Kaliteli Ürünler</h3>
          <p className="text-sm text-muted-foreground">Saç sağlığını koruyan premium ürünler</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Kolay Randevu</h3>
          <p className="text-sm text-muted-foreground">Birkaç tıkla randevunuzu oluşturun</p>
        </div>
      </div>

      {randevular && randevular.length > 0 ? (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold mb-2">Mevcut Randevular</h2>
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
      ) : (
        <div className="text-center p-8 bg-secondary/30 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Henüz randevunuz bulunmuyor</h2>
          <p className="text-muted-foreground mb-4">Yukarıdaki butona tıklayarak yeni bir randevu oluşturabilirsiniz.</p>
        </div>
      )}
    </div>
  );
}
