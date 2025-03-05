
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase';
import { gunSiralama, gunIsimleri } from './constants/workingDays';

export const WorkingHoursForm = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const defaultCalismaSaatleri = [
    { gun: "pazartesi", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "sali", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "carsamba", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "persembe", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "cuma", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "cumartesi", acilis: "10:00", kapanis: "16:00", kapali: false },
    { gun: "pazar", acilis: "10:00", kapanis: "14:00", kapali: true }
  ] as Omit<CalismaSaati, "id">[];
  
  const { data: calismaSaatleri = [], isLoading: saatlerLoading } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      try {
        const data = await calismaSaatleriServisi.hepsiniGetir();
        return data.sort((a, b) => gunSiralama.indexOf(a.gun) - gunSiralama.indexOf(b.gun));
      } catch (error) {
        toast.error("Çalışma saatleri yüklenirken bir hata oluştu.");
        return [];
      }
    }
  });

  const [saatler, setSaatler] = useState<(CalismaSaati | Omit<CalismaSaati, "id">)[]>(
    calismaSaatleri.length > 0
      ? calismaSaatleri.sort((a, b) => gunSiralama.indexOf(a.gun) - gunSiralama.indexOf(b.gun))
      : defaultCalismaSaatleri
  );

  const handleSaat = (index: number, field: keyof CalismaSaati, value: any) => {
    const newSaatler = [...saatler];
    (newSaatler[index] as any)[field] = value;

    // Günleri sıralı tut
    newSaatler.sort((a, b) => gunSiralama.indexOf(a.gun) - gunSiralama.indexOf(b.gun));
    setSaatler(newSaatler);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (calismaSaatleri.length === 0) {
        // Yeni kayıtlar oluştur
        for (const saat of saatler) {
          await calismaSaatleriServisi.ekle(saat as Omit<CalismaSaati, "id">);
        }
      } else {
        // Mevcut kayıtları güncelle
        await calismaSaatleriServisi.guncelle(saatler as CalismaSaati[]);
      }
      
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
      toast.success("Çalışma saatleri başarıyla kaydedildi.");
    } catch (error) {
      console.error(error);
      toast.error("Çalışma saatleri kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (saatlerLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Çalışma Saatleri</h2>
      <div className="grid gap-4">
        {saatler.map((saat, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            <div className="font-medium">{gunIsimleri[saat.gun] || saat.gun}</div>
            <Input
              type="time"
              value={saat.acilis || ""}
              onChange={(e) => handleSaat(index, 'acilis', e.target.value)}
              disabled={saat.kapali}
            />
            <Input
              type="time"
              value={saat.kapanis || ""}
              onChange={(e) => handleSaat(index, 'kapanis', e.target.value)}
              disabled={saat.kapali}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={!saat.kapali}
                onCheckedChange={(checked) => handleSaat(index, 'kapali', !checked)}
              />
              <span>{saat.kapali ? 'Kapalı' : 'Açık'}</span>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </div>
  );
};
