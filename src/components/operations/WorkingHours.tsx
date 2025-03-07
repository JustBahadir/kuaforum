
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { CalismaSaati } from '@/lib/supabase/types';
import { WorkingHoursRow } from './WorkingHoursRow';
import { useWorkingHours } from './hooks/useWorkingHours';
import { gunSiralama } from './constants/workingDays';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

interface WorkingHoursProps {
  isStaff?: boolean;
  gunler?: CalismaSaati[];
  dukkanId?: number;
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void;
}

export function WorkingHours({ isStaff = true, gunler = [], dukkanId, onChange }: WorkingHoursProps) {
  const { toast: uiToast } = useToast();
  
  const { 
    calismaSaatleri, 
    editing, 
    tempChanges,
    isLoading,
    isUpdating,
    error,
    startEditing,
    handleTempChange,
    saveChanges,
    cancelEditing,
    handleStatusToggle,
    refetch
  } = useWorkingHours(isStaff, gunler, dukkanId, onChange);
  
  useEffect(() => {
    if (error) {
      console.error("WorkingHours component error:", error);
      uiToast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışma saatleri yüklenirken bir hata oluştu."
      });
    }
  }, [error, uiToast]);

  // If no working hours exist, show skeleton while loading
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden p-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Gün</TableHead>
            <TableHead>Açılış</TableHead>
            <TableHead>Kapanış</TableHead>
            {isStaff && <TableHead>Durum</TableHead>}
            {isStaff && <TableHead className="text-right">İşlemler</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {calismaSaatleri.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isStaff ? 5 : 3} className="text-center py-6 text-gray-500">
                {gunSiralama.map((gun, index) => (
                  <WorkingHoursRow
                    key={index}
                    saat={{
                      id: index,
                      gun,
                      acilis: "09:00",
                      kapanis: "18:00",
                      kapali: false,
                      dukkan_id: dukkanId || 0
                    }}
                    index={index}
                    isStaff={isStaff}
                    editing={editing}
                    isUpdating={isUpdating}
                    tempChanges={tempChanges}
                    onStartEditing={startEditing}
                    onTempChange={handleTempChange}
                    onSaveChanges={saveChanges}
                    onCancelEditing={cancelEditing}
                    onStatusToggle={handleStatusToggle}
                  />
                ))}
              </TableCell>
            </TableRow>
          ) : (
            calismaSaatleri.map((saat, index) => (
              <WorkingHoursRow
                key={typeof saat.id !== 'undefined' ? saat.id : index}
                saat={saat}
                index={index}
                isStaff={isStaff}
                editing={editing}
                isUpdating={isUpdating}
                tempChanges={tempChanges}
                onStartEditing={startEditing}
                onTempChange={handleTempChange}
                onSaveChanges={saveChanges}
                onCancelEditing={cancelEditing}
                onStatusToggle={handleStatusToggle}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
