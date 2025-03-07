
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { CalismaSaati } from '@/lib/supabase/types';
import { gunIsimleri } from './constants/workingDays';
import { Edit, Save, X } from 'lucide-react';

interface WorkingHoursRowProps {
  saat: CalismaSaati;
  index: number;
  isStaff: boolean;
  editing: number | null;
  tempChanges: Record<number, Partial<CalismaSaati>>;
  onStartEditing: (id: number) => void;
  onTempChange: (id: number, field: keyof CalismaSaati, value: any) => void;
  onSaveChanges: (id: number) => void;
  onCancelEditing: (id: number) => void;
}

export function WorkingHoursRow({
  saat,
  index,
  isStaff,
  editing,
  tempChanges,
  onStartEditing,
  onTempChange,
  onSaveChanges,
  onCancelEditing
}: WorkingHoursRowProps) {
  const uniqueId = saat.id !== undefined ? saat.id : index;
  const isEditing = editing === uniqueId;
  const isKapali = (tempChanges[uniqueId]?.kapali !== undefined) 
    ? tempChanges[uniqueId].kapali 
    : saat.kapali;

  const handleStatusToggle = (checked: boolean) => {
    const newStatus = !checked;
    if (isEditing) {
      onTempChange(uniqueId, 'kapali', newStatus);
    } else if (isStaff) {
      onTempChange(uniqueId, 'kapali', newStatus);
      onSaveChanges(uniqueId);
    }
  };

  return (
    <TableRow key={uniqueId} className="hover:bg-gray-50">
      <TableCell className="font-medium">
        {gunIsimleri[saat.gun] || saat.gun}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="time"
            value={(tempChanges[uniqueId]?.acilis !== undefined) 
              ? tempChanges[uniqueId].acilis || "" 
              : saat.acilis || ""}
            onChange={(e) => onTempChange(uniqueId, 'acilis', e.target.value)}
            disabled={isKapali}
            className="w-32"
          />
        ) : (
          isKapali ? "-" : (saat.acilis?.substring(0, 5) || "-")
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="time"
            value={(tempChanges[uniqueId]?.kapanis !== undefined) 
              ? tempChanges[uniqueId].kapanis || "" 
              : saat.kapanis || ""}
            onChange={(e) => onTempChange(uniqueId, 'kapanis', e.target.value)}
            disabled={isKapali}
            className="w-32"
          />
        ) : (
          isKapali ? "-" : (saat.kapanis?.substring(0, 5) || "-")
        )}
      </TableCell>
      {isStaff && <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={!isKapali}
            onCheckedChange={(checked) => handleStatusToggle(checked)}
            disabled={!isStaff || (isStaff && !isEditing && editing !== null)}
          />
          <span className="text-sm text-gray-600">
            {isKapali ? "Kapalı" : "Açık"}
          </span>
        </div>
      </TableCell>}
      {isStaff && (
        <TableCell className="text-right">
          {isEditing ? (
            <div className="flex gap-2 justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => onSaveChanges(uniqueId)}
              >
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancelEditing(uniqueId)}
              >
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartEditing(uniqueId)}
              disabled={editing !== null && editing !== uniqueId}
            >
              <Edit className="h-4 w-4 mr-1" />
              Düzenle
            </Button>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}
