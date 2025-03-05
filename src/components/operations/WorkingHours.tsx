
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { CalismaSaati } from '@/lib/supabase/types';
import { WorkingHoursRow } from './WorkingHoursRow';
import { useWorkingHours } from './hooks/useWorkingHours';
import { gunSirasi } from './constants/workingDays';

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

  // Sort days based on the predefined order
  const sortedSaatler = [...calismaSaatleri].sort((a, b) => {
    const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
    const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
    return aIndex - bIndex;
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Gün</TableHead>
            <TableHead>Açılış</TableHead>
            <TableHead>Kapanış</TableHead>
            <TableHead>Durum</TableHead>
            {isStaff && <TableHead className="text-right">İşlemler</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSaatler.map((saat: CalismaSaati, index: number) => (
            <WorkingHoursRow
              key={saat.id || index}
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
