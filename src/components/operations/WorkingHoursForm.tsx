
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase';

export const WorkingHoursForm = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const defaultCalismaSaatleri = [
    { gun: "Pazartesi", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Salı", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Çarşamba", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Perşembe", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Cuma", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Cumartesi", acilis: "10:00", kapanis: "16:00", kapali: false },
    { gun: "Pazar", acilis: "10:00", kapanis: "14:00", kapali: true }
  ] as Omit<CalismaSaati, "id">[];
  
  const { data: calismaSaatleri = [], isLoading: saatlerLoading } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      try {
        return await calismaSaatleriServisi.hepsiniGetir();
      } catch (error) {
        toast.error("Çalışma saatleri yüklenirken bir hata oluştu.");
        return [];
      }
    }
  });

  const [saatler, setSaatler] = useState<(CalismaSaati | Omit<CalismaSaati, "id">)[]>(
    calismaSaatleri.length > 0 ? calismaSaatleri : defaultCalismaSaatleri
  );

  const handleSaat = (index: number, field: keyof CalismaSaati, value: any) => {
    const newSaatler = [...saatler];
    (newSaatler[index] as any)[field] = value;
    setSaatler(newSaatler);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (calismaSaatleri.length === 0) {
        // Create new records
        for (const saat of saatler) {
          await calismaSaatleriServisi.ekle(saat as Omit<CalismaSaati, "id">);
        }
      } else {
        // Update existing records
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
            <div className="font-medium">{saat.gun}</div>
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
