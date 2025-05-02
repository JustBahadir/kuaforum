
import React, { useState, useEffect } from "react";
import { CalismaSaati } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { gunIsimleri } from "./constants/workingDays";
import { toast } from "sonner";
import { sortWorkingHours } from "./utils/workingHoursUtils";

interface WorkingHoursProps {
  dukkanId?: number | null;
}

export function WorkingHours({ dukkanId }: WorkingHoursProps) {
  const [calismaSaatleri, setCalismaSaatleri] = useState<CalismaSaati[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadWorkingHours = async () => {
      try {
        if (!dukkanId) return;
        
        setLoading(true);
        const hours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        setCalismaSaatleri(sortWorkingHours(hours));
      } catch (error) {
        console.error("Failed to load working hours:", error);
        toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadWorkingHours();
  }, [dukkanId]);

  const handleTimeChange = (index: number, field: 'acilis' | 'kapanis', value: string) => {
    setCalismaSaatleri(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
  };

  const handleClosedToggle = (index: number, value: boolean) => {
    setCalismaSaatleri(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          kapali: value,
          acilis: value ? null : (updated[index].acilis || "09:00"),
          kapanis: value ? null : (updated[index].kapanis || "18:00")
        };
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!dukkanId) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }

    try {
      setSaving(true);
      // Make sure all hours have the correct dukkanId
      const updatedHours = calismaSaatleri.map(saat => ({
        ...saat,
        dukkan_id: dukkanId
      }));

      await calismaSaatleriServisi.saatleriGuncelle(updatedHours);
      toast.success("Çalışma saatleri güncellendi");
    } catch (error) {
      console.error("Failed to save working hours:", error);
      toast.error("Çalışma saatleri güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
      <CardContent>
        {calismaSaatleri.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Henüz çalışma saati tanımlanmamış
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {calismaSaatleri.map((saat, index) => (
                <div key={saat.id || index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 md:col-span-2">
                    <p className="font-medium">{gunIsimleri[saat.gun]}</p>
                  </div>
                  
                  <div className="col-span-4 md:col-span-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`kapali-${index}`}
                        checked={!!saat.kapali}
                        onCheckedChange={(checked) => handleClosedToggle(index, checked)}
                      />
                      <Label htmlFor={`kapali-${index}`}>Kapalı</Label>
                    </div>
                  </div>

                  <div className="col-span-5 md:col-span-6">
                    {!saat.kapali && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={saat.acilis || ""}
                          onChange={(e) => handleTimeChange(index, 'acilis', e.target.value)}
                          disabled={saat.kapali}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={saat.kapanis || ""}
                          onChange={(e) => handleTimeChange(index, 'kapanis', e.target.value)}
                          disabled={saat.kapali}
                          className="border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkingHoursCard({ dukkanId }: WorkingHoursProps) {
  return <WorkingHours dukkanId={dukkanId} />;
}
