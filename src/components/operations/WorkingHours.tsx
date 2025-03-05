
import { Table } from '@/components/ui/table';
import { CalismaSaati } from '@/lib/supabase/types';
import { WorkingHoursRow } from './WorkingHoursRow';
import { useWorkingHours } from './hooks/useWorkingHours';

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
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gün</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açılış</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapanış</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
            {isStaff && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calismaSaatleri.map((saat: CalismaSaati, index: number) => (
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
        </tbody>
      </Table>
    </div>
  );
}
