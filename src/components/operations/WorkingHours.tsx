
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CalismaSaati } from "@/lib/supabase/types";
import { useWorkingHours } from "./hooks/useWorkingHours";
import { WorkingHoursTable } from "./working-hours/WorkingHoursTable";
import { WorkingHoursActions } from "./working-hours/WorkingHoursActions";
import { WorkingHoursLoadingState } from "./working-hours/WorkingHoursLoadingState";
import { WorkingHoursErrorState } from "./working-hours/WorkingHoursErrorState";

interface WorkingHoursProps {
  isStaff?: boolean;
  dukkanId?: number;
}

export function WorkingHours({ isStaff = true, dukkanId }: WorkingHoursProps) {
  const [editingMode, setEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    hours,
    updateDay,
    saveHours,
    resetHours,
    isLoading,
    error,
    isError,
    hasChanges,
    refetch
  } = useWorkingHours({ 
    dukkanId: dukkanId || 0,
    onMutationSuccess: () => setEditingMode(false)
  });

  const handleEdit = () => {
    setEditingMode(true);
  };

  const handleCancel = () => {
    resetHours();
    setEditingMode(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate times
      for (const saat of hours) {
        if (!saat.kapali) {
          if (!saat.acilis || !saat.kapanis) {
            toast.error("Açık günler için açılış ve kapanış saatleri gereklidir");
            setIsSaving(false);
            return;
          }
          
          // Parse times and check if opening is before closing
          const acilis = saat.acilis.split(':').map(Number);
          const kapanis = saat.kapanis.split(':').map(Number);
          
          const acilisDakika = acilis[0] * 60 + acilis[1];
          const kapanisDakika = kapanis[0] * 60 + kapanis[1];
          
          if (acilisDakika >= kapanisDakika) {
            toast.error(`${saat.gun} için açılış saati kapanış saatinden önce olmalıdır`);
            setIsSaving(false);
            return;
          }
        }
      }
      
      await saveHours();
      toast.success("Çalışma saatleri başarıyla güncellendi");
    } catch (error) {
      console.error("Error saving working hours:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = (index: number, field: "acilis" | "kapanis", value: string) => {
    updateDay(index, { [field]: value });
  };

  const handleStatusChange = (index: number, value: boolean) => {
    const updates: Partial<CalismaSaati> = { kapali: value };
    
    // Clear times if closed
    if (value) {
      updates.acilis = null;
      updates.kapanis = null;
    } else {
      // Set default times if opening
      updates.acilis = "09:00";
      updates.kapanis = "19:00";
    }
    
    updateDay(index, updates);
  };

  if (isLoading) {
    return <WorkingHoursLoadingState />;
  }

  if (isError) {
    return <WorkingHoursErrorState onRetry={refetch} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        <div className="flex space-x-2">
          <WorkingHoursActions
            editingMode={editingMode}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
            hasChanges={hasChanges()}
          />
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
