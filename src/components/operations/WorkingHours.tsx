
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
  dukkanId?: number;
}

export function WorkingHours({ dukkanId }: WorkingHoursProps) {
  const [editingMode, setEditingMode] = useState(false);
  const { hours: fetchedHours, isLoading, isError, refetch } = useWorkingHours(dukkanId);
  const [hours, setHours] = useState<CalismaSaati[]>([]);
  
  useEffect(() => {
    if (fetchedHours) {
      setHours(sortWorkingHours(fetchedHours));
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
  
  const handleSave = async () => {
    try {
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
    } catch (error) {
      console.error("Failed to save working hours:", error);
      toast.error("Çalışma saatlerini kaydetme hatası");
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
                  if (fetchedHours) {
                    setHours(sortWorkingHours(fetchedHours));
                  }
                }}
              >
                İptal
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSave}
              >
                Kaydet
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
