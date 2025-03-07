
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
  isUpdating?: boolean; 
  tempChanges: Record<number, Partial<CalismaSaati>>;
  onStartEditing: (id: number) => void;
  onTempChange: (id: number, field: keyof CalismaSaati, value: any) => void;
  onSaveChanges: (id: number) => void;
  onCancelEditing: (id: number) => void;
  onStatusToggle?: (id: number, isOpen: boolean) => void;
}

export function WorkingHoursRow({
  saat,
  index,
  isStaff,
  editing,
  isUpdating = false,
  tempChanges,
  onStartEditing,
  onTempChange,
  onSaveChanges,
  onCancelEditing,
  onStatusToggle
}: WorkingHoursRowProps) {
  // Ensure we have a numeric ID for comparisons
  const saatId = typeof saat.id === 'number' ? saat.id : Number(saat.id);
  const isEditing = editing === saatId;
  
  // Get current status (either from temp changes or from the original data)
  const isKapali = (tempChanges[saatId]?.kapali !== undefined) 
    ? tempChanges[saatId].kapali 
    : saat.kapali;

  const handleStatusToggle = (checked: boolean) => {
    if (isEditing) {
      // In edit mode, just update the temp changes
      onTempChange(saatId, 'kapali', !checked);
      
      // Clear times if closed
      if (!checked) {
        onTempChange(saatId, 'acilis', null);
        onTempChange(saatId, 'kapanis', null);
      } else if (!saat.acilis && !saat.kapanis) {
        // Set default times if opening and no times exist
        onTempChange(saatId, 'acilis', "09:00");
        onTempChange(saatId, 'kapanis', "18:00");
      }
    } else if (isStaff && onStatusToggle) {
      // Direct toggle without edit mode
      onStatusToggle(saatId, checked);
    }
  };

  return (
    <TableRow key={saatId} className="hover:bg-gray-50">
      <TableCell className="font-medium">
        {gunIsimleri[saat.gun] || saat.gun}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="time"
            value={(tempChanges[saatId]?.acilis !== undefined) 
              ? tempChanges[saatId].acilis || "" 
              : saat.acilis || ""}
            onChange={(e) => onTempChange(saatId, 'acilis', e.target.value)}
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
            value={(tempChanges[saatId]?.kapanis !== undefined) 
              ? tempChanges[saatId].kapanis || "" 
              : saat.kapanis || ""}
            onChange={(e) => onTempChange(saatId, 'kapanis', e.target.value)}
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
            disabled={!isStaff || (isStaff && !isEditing && editing !== null) || isUpdating}
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
                onClick={() => onSaveChanges(saatId)}
                disabled={isUpdating}
              >
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancelEditing(saatId)}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartEditing(saatId)}
              disabled={(editing !== null && editing !== saatId) || isUpdating}
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
