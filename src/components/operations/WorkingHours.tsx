
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { CalismaSaati } from '@/lib/supabase/types';
import { WorkingHoursRow } from './WorkingHoursRow';
import { useWorkingHours } from './hooks/useWorkingHours';
import { gunSiralama } from './constants/workingDays';

interface WorkingHoursProps {
  isStaff?: boolean;
  gunler?: CalismaSaati[];
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void;
}

export function WorkingHours({ isStaff = true, gunler = [], onChange }: WorkingHoursProps) {
  const { 
    calismaSaatleri, 
    editing, 
    tempChanges,
    startEditing,
    handleTempChange,
    saveChanges,
    cancelEditing
  } = useWorkingHours(isStaff, gunler, onChange);

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
          {calismaSaatleri.map((saat: CalismaSaati, index: number) => (
            <WorkingHoursRow
              key={saat.id !== undefined ? saat.id : index}
              saat={saat}
              index={index}
              isStaff={isStaff}
              editing={editing}
              tempChanges={tempChanges}
              onStartEditing={startEditing}
              onTempChange={handleTempChange}
              onSaveChanges={saveChanges}
              onCancelEditing={cancelEditing}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
