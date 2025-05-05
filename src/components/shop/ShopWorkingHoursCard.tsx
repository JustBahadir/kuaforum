import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { calismaSaatleriServisi } from '@/lib/supabase';

interface WorkingHours {
  [key: string]: {
    id: string;
    acilis: string;
    kapanis: string;
    kapali: boolean;
  };
}

export default function ShopWorkingHoursCard() {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    Pazartesi: { id: "", acilis: "09:00", kapanis: "18:00", kapali: false },
    Salı: { id: "", acilis: "09:00", kapanis: "18:00", kapali: false },
    Çarşamba: { id: "", acilis: "09:00", kapanis: "18:00", kapali: false },
    Perşembe: { id: "", acilis: "09:00", kapanis: "18:00", kapali: false },
    Cuma: { id: "", acilis: "09:00", kapanis: "18:00", kapali: false },
    Cumartesi: { id: "", acilis: "09:00", kapanis: "18:00", kapali: false },
    Pazar: { id: "", acilis: "10:00", kapanis: "16:00", kapali: true },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkingHours = async () => {
      setIsLoading(true);
      try {
        const dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
        if (!dukkanId) {
          toast.error("Dükkan ID alınamadı!");
          return;
        }
        const saatler = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        const initialWorkingHours: WorkingHours = {};
        saatler.forEach(saat => {
          initialWorkingHours[saat.gun] = {
            id: saat.id,
            acilis: saat.acilis,
            kapanis: saat.kapanis,
            kapali: saat.kapali
          };
        });
        setWorkingHours(initialWorkingHours);
      } catch (error) {
        console.error("Çalışma saatleri yüklenirken hata:", error);
        toast.error("Çalışma saatleri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkingHours();
  }, []);

  const handleInputChange = (gun: string, field: string, value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [gun]: {
        ...prev[gun],
        [field]: value
      }
    }));
  };

  const handleSwitchChange = (gun: string, checked: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [gun]: {
        ...prev[gun],
        kapali: checked
      }
    }));
  };

  const saveWorkingHours = async () => {
    setIsLoading(true);
    try {
      const dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
      if (!dukkanId) {
        toast.error("Dükkan ID alınamadı!");
        return;
      }

      const workingHoursData = Object.entries(workingHours).map(([day, hours]) => ({
        id: String(hours.id),
        dukkan_id: dukkanId,
        gun: day,
        acilis: hours.acilis,
        kapanis: hours.kapanis,
        kapali: hours.kapali,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const success = await calismaSaatleriServisi.saatleriKaydet(workingHoursData);
      if (success) {
        toast.success("Çalışma saatleri başarıyla kaydedildi!");
      } else {
        toast.error("Çalışma saatleri kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error("Çalışma saatleri kaydedilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Çalışma saatleri yükleniyor...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
        <CardDescription>İşletmenizin çalışma saatlerini ayarlayın.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(workingHours).map(([gun, saat]) => (
          <div key={gun} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={gun} className="text-right">
              {gun}
            </Label>
            <Input
              type="time"
              id={`${gun}-acilis`}
              value={saat.acilis}
              onChange={(e) => handleInputChange(gun, 'acilis', e.target.value)}
              disabled={saat.kapali}
              className="col-span-1"
            />
            <Input
              type="time"
              id={`${gun}-kapanis`}
              value={saat.kapanis}
              onChange={(e) => handleInputChange(gun, 'kapanis', e.target.value)}
              disabled={saat.kapali}
              className="col-span-1"
            />
            <Switch
              id={gun}
              checked={saat.kapali}
              onCheckedChange={(checked) => handleSwitchChange(gun, checked)}
            />
          </div>
        ))}
        <Button onClick={saveWorkingHours} disabled={isLoading}>
          Kaydet
        </Button>
      </CardContent>
    </Card>
  );
}
