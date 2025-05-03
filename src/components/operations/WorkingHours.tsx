
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalismaSaati } from "@/lib/supabase/types";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { useWorkingHours } from "./hooks/useWorkingHours";
import { WorkingHoursTable } from "./working-hours/WorkingHoursTable";
import { sortWorkingHours } from "./utils/workingHoursUtils";

interface WorkingHoursProps {
  dukkanId?: number | null;
}

export function WorkingHours({ dukkanId }: WorkingHoursProps) {
  const [editingMode, setEditingMode] = useState(false);
  const { hours: fetchedHours, isLoading, isError, refetch } = useWorkingHours(dukkanId);
  const [hours, setHours] = useState<CalismaSaati[]>([]);
  const [saving, setSaving] = useState(false);
  const [originalHours, setOriginalHours] = useState<CalismaSaati[]>([]);

  console.log("WorkingHours component render - dukkanId:", dukkanId);
  console.log("Fetched hours:", fetchedHours);
  
  useEffect(() => {
    if (fetchedHours && fetchedHours.length > 0) {
      console.log("Setting hours from fetchedHours:", fetchedHours);
      const sortedHours = sortWorkingHours(fetchedHours);
      setHours(sortedHours);
      setOriginalHours(sortedHours);
    }
  }, [fetchedHours]);

  const handleTimeChange = (index: number, field: "acilis" | "kapanis", value: string) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], [field]: value };
      return newHours;
    });
  };
  
  const handleStatusChange = (index: number, value: boolean) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], kapali: value };
      return newHours;
    });
  };

  const hasChanges = () => {
    if (hours.length !== originalHours.length) return true;
    
    return hours.some((hour, index) => {
      const original = originalHours[index];
      return (
        hour.acilis !== original.acilis ||
        hour.kapanis !== original.kapanis ||
        hour.kapali !== original.kapali
      );
    });
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("Saving hours:", hours);
      
      if (!dukkanId) {
        const shopId = await calismaSaatleriServisi.getCurrentDukkanId();
        console.log("Retrieved dukkanId:", shopId);
        
        if (!shopId) {
          toast.error("İşletme bilgisi bulunamadı");
          setSaving(false);
          return;
        }
        
        // Update each hour with shop ID
        for (const hour of hours) {
          hour.dukkan_id = shopId;
        }
      }
      
      // Update or create hours
      for (const hour of hours) {
        if (hour.id) {
          await calismaSaatleriServisi.guncelle(hour.id, hour);
        } else {
          const shopId = dukkanId || await calismaSaatleriServisi.getCurrentDukkanId();
          await calismaSaatleriServisi.ekle({
            ...hour,
            dukkan_id: shopId
          });
        }
      }
      
      toast.success("Çalışma saatleri başarıyla kaydedildi");
      setEditingMode(false);
      refetch();
      
      // Update original hours to current state to reset change detection
      setOriginalHours([...hours]);
    } catch (error) {
      console.error("Failed to save working hours:", error);
      toast.error("Çalışma saatlerini kaydetme hatası");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Çalışma saatleri yüklenirken bir hata oluştu</p>
            <Button onClick={() => refetch()}>Yeniden Dene</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        <div className="flex gap-2">
          {editingMode ? (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setEditingMode(false);
                  // Reset to original data
                  setHours([...originalHours]);
                }}
                disabled={saving}
              >
                İptal
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setEditingMode(true)}
            >
              Düzenle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <WorkingHoursTable 
          hours={hours}
          editingMode={editingMode}
          onTimeChange={handleTimeChange}
          onStatusChange={handleStatusChange}
        />
      </CardContent>
    </Card>
  );
}
