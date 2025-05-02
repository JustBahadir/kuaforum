
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { gunIsimleri } from "./constants/workingDays";

export interface WorkingHoursProps {
  dukkanId: number | null;
}

export function WorkingHoursCard({ dukkanId }: WorkingHoursProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [workingHours, setWorkingHours] = useState<any[]>([]);

  const { data: calisma_saatleri = [], isLoading, refetch } = useQuery({
    queryKey: ['calisma_saatleri', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      try {
        return await calismaSaatleriServisi.hepsiniGetir(dukkanId);
      } catch (error) {
        console.error("Çalışma saatleri alınırken hata:", error);
        toast.error("Çalışma saatleri alınamadı");
        return [];
      }
    },
    enabled: !!dukkanId,
  });

  useEffect(() => {
    if (calisma_saatleri.length > 0) {
      setWorkingHours(calisma_saatleri);
    } else if (!isLoading && dukkanId) {
      // Initialize default working hours if none exist
      const defaultHours = [
        { gun: "Pazartesi", gun_sira: 1, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: dukkanId },
        { gun: "Salı", gun_sira: 2, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: dukkanId },
        { gun: "Çarşamba", gun_sira: 3, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: dukkanId },
        { gun: "Perşembe", gun_sira: 4, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: dukkanId },
        { gun: "Cuma", gun_sira: 5, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: dukkanId },
        { gun: "Cumartesi", gun_sira: 6, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: dukkanId },
        { gun: "Pazar", gun_sira: 0, acilis: "09:00", kapanis: "18:00", kapali: true, dukkan_id: dukkanId },
      ];
      setWorkingHours(defaultHours);
    }
  }, [calisma_saatleri, isLoading, dukkanId]);

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setWorkingHours(updatedHours);
  };

  const handleSave = async () => {
    try {
      if (!dukkanId) {
        toast.error("İşletme bilgisi bulunamadı");
        return;
      }

      for (const hours of workingHours) {
        if (hours.id) {
          await calismaSaatleriServisi.guncelle(hours.id, {
            acilis: hours.acilis,
            kapanis: hours.kapanis,
            kapali: hours.kapali,
          });
        } else {
          await calismaSaatleriServisi.ekle({
            gun: hours.gun,
            gun_sira: hours.gun_sira,
            acilis: hours.acilis,
            kapanis: hours.kapanis,
            kapali: hours.kapali,
            dukkan_id: dukkanId,
          });
        }
      }

      toast.success("Çalışma saatleri kaydedildi");
      setEditing(false);
      refetch();
    } catch (error) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error("Çalışma saatleri kaydedilemedi");
    }
  };

  const handleReset = () => {
    setWorkingHours(calisma_saatleri);
    setEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Çalışma Saatleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)}>Düzenle</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>İptal</Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workingHours.map((hours, index) => (
            <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2 border-b">
              <div className="font-medium w-28">{hours.gun}</div>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`closed-${index}`}
                    checked={!hours.kapali}
                    onCheckedChange={(checked) => handleInputChange(index, 'kapali', !checked)}
                    disabled={!editing}
                  />
                  <Label htmlFor={`closed-${index}`}>{hours.kapali ? 'Kapalı' : 'Açık'}</Label>
                </div>
                {!hours.kapali && (
                  <div className="flex flex-1 items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`open-${index}`} className="whitespace-nowrap">Açılış:</Label>
                      <Input
                        id={`open-${index}`}
                        type="time"
                        value={hours.acilis || ''}
                        onChange={(e) => handleInputChange(index, 'acilis', e.target.value)}
                        disabled={!editing}
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`close-${index}`} className="whitespace-nowrap">Kapanış:</Label>
                      <Input
                        id={`close-${index}`}
                        type="time"
                        value={hours.kapanis || ''}
                        onChange={(e) => handleInputChange(index, 'kapanis', e.target.value)}
                        disabled={!editing}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
