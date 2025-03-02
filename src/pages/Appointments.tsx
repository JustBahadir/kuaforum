
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Scissors, ChevronLeft, LogOut, Home, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Randevu, RandevuDurumu } from '@/lib/supabase';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Appointments() {
  const [yeniRandevuAcik, setYeniRandevuAcik] = useState(false);
  const [seciliRandevu, setSeciliRandevu] = useState<Randevu | null>(null);
  const [silinecekRandevu, setSilinecekRandevu] = useState<Randevu | null>(null);
  const navigate = useNavigate();

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

  const handleRandevuCreated = async (randevu: Randevu) => {
    await randevulariYenile();
    toast({
      title: "Başarılı",
      description: "Randevu talebiniz alındı.",
    });
    setYeniRandevuAcik(false);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Başarılı",
        description: "Başarıyla çıkış yapıldı",
      });
      navigate("/");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
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
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/customer-dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-purple-700">Kuaför Randevu</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/customer-dashboard/profile')}
              className="hidden md:flex items-center gap-1"
            >
              <User className="h-4 w-4" />
              Profilim
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Çıkış Yap</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16">
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Randevu Al</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                onAppointmentCreated={handleRandevuCreated}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden p-2 flex justify-around z-50">
          <Link to="/customer-dashboard">
            <Button variant="ghost" className="flex flex-col items-center text-xs p-2">
              <Home className="h-5 w-5" />
              Ana Sayfa
            </Button>
          </Link>
          <Button variant="ghost" className="flex flex-col items-center text-xs p-2">
            <Calendar className="h-5 w-5" />
            Randevular
          </Button>
          <Link to="/customer-dashboard/profile">
            <Button variant="ghost" className="flex flex-col items-center text-xs p-2">
              <User className="h-5 w-5" />
              Profil
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center text-xs p-2 text-red-500" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Çıkış
          </Button>
        </div>

        <div className="grid gap-4 mb-20 md:mb-4">
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
      </div>
    </div>
  );
}
