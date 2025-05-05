
import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalismaSaati } from '@/lib/supabase/types';
import { gunIsimleri } from './utils/workingHoursUtils';
import { useWorkingHours } from './hooks/useWorkingHours';
import { Loader2 } from 'lucide-react';

interface CalismaSaatleriProps {
  dukkanId?: string;
  onSave?: () => void;
}

const CalismaSaatleri = ({ dukkanId, onSave }: CalismaSaatleriProps) => {
  const { 
    calismaSaatleri, 
    setCalismaSaatleri, 
    yukleniyor, 
    hata, 
    saatleriKaydet, 
    saatleriSifirla 
  } = useWorkingHours(dukkanId);
  
  const [kayitYukleniyor, setKayitYukleniyor] = useState(false);
  
  // Sıralanmış çalışma saatleri (Pazartesi'den Pazar'a)
  const siraliSaatler = useMemo(() => {
    return [...calismaSaatleri].sort((a, b) => {
      return gunIsimleri.indexOf(a.gun) - gunIsimleri.indexOf(b.gun);
    });
  }, [calismaSaatleri]);
  
  // Çalışma saatlerini güncelle
  const handleUpdateHours = (index: number, field: 'acilis' | 'kapanis', value: string) => {
    const yeniSaatler = [...calismaSaatleri];
    yeniSaatler[index] = { ...yeniSaatler[index], [field]: value };
    setCalismaSaatleri(yeniSaatler);
  };
  
  // Açık/kapalı durumunu değiştir
  const handleToggleClosed = (index: number, kapali: boolean) => {
    const yeniSaatler = [...calismaSaatleri];
    yeniSaatler[index] = { ...yeniSaatler[index], kapali };
    setCalismaSaatleri(yeniSaatler);
  };
  
  // Kaydet butonu fonksiyonu
  const handleSave = async () => {
    setKayitYukleniyor(true);
    
    try {
      const sonuc = await saatleriKaydet();
      
      if (sonuc && onSave) {
        onSave();
      }
    } finally {
      setKayitYukleniyor(false);
    }
  };
  
  if (yukleniyor) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (hata) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{hata}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {siraliSaatler.map((saat, index) => (
          <div key={saat.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
            <div>
              <Label htmlFor={`gun-${index}`} className="font-medium">
                {saat.gun}
              </Label>
            </div>
            <Input
              id={`acilis-${index}`}
              type="time"
              value={saat.acilis}
              onChange={(e) => handleUpdateHours(index, 'acilis', e.target.value)}
              className="w-32"
              disabled={saat.kapali}
            />
            <Input
              id={`kapanis-${index}`}
              type="time"
              value={saat.kapanis}
              onChange={(e) => handleUpdateHours(index, 'kapanis', e.target.value)}
              className="w-32"
              disabled={saat.kapali}
            />
            <div className="flex items-center space-x-2">
              <Switch
                id={`kapali-${index}`}
                checked={!saat.kapali}
                onCheckedChange={(checked) => handleToggleClosed(index, !checked)}
              />
              <Label htmlFor={`kapali-${index}`} className="text-sm">
                {saat.kapali ? 'Kapalı' : 'Açık'}
              </Label>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={saatleriSifirla} disabled={kayitYukleniyor}>
          Sıfırla
        </Button>
        <Button onClick={handleSave} disabled={kayitYukleniyor}>
          {kayitYukleniyor ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Değişiklikleri Kaydet'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalismaSaatleri;
