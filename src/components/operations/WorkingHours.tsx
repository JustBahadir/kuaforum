
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { CalismaSaati } from '@/lib/supabase/types';
import { WorkingHoursRow } from './WorkingHoursRow';
import { useWorkingHours } from './hooks/useWorkingHours';
import { gunSiralama } from './constants/workingDays';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
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
        description: "Çalışma saatleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
      });
    }
  }, [error, uiToast]);

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

  const handleCreateDefaultHours = async () => {
    if (!dukkanId) {
      uiToast({
        variant: "destructive",
        title: "Hata",
        description: "Dükkan ID bilgisi bulunamadı."
      });
      return;
    }
    
    try {
      await calismaSaatleriServisi.varsayilanSaatleriOlustur(dukkanId);
      toast.success("Varsayılan çalışma saatleri oluşturuldu");
      refetch();
    } catch (err) {
      console.error("Varsayılan saatler oluşturulurken hata:", err);
      toast.error("Varsayılan saatler oluşturulurken hata oluştu");
    }
  };

  if (error) {
    return (
      <div className="border rounded-lg overflow-hidden p-4 text-red-500">
        Çalışma saatleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
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
                <div>
                  Çalışma saati bilgisi bulunamadı
                  {isStaff && dukkanId && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCreateDefaultHours}
                      >
                        Varsayılan Saatleri Oluştur
                      </Button>
                    </div>
                  )}
                </div>
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
