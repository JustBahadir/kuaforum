
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CalismaSaati } from '@/lib/supabase/types';
import { gunIsimleri } from './constants/workingDays';

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
  const uniqueId = saat.id || index;
  const isEditing = editing === uniqueId;

  return (
    <tr key={uniqueId}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {gunIsimleri[saat.gun] || saat.gun}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <Input
            type="time"
            defaultValue={saat.acilis}
            onChange={(e) => onTempChange(uniqueId, 'acilis', e.target.value)}
            disabled={(tempChanges[uniqueId]?.kapali !== undefined) 
              ? tempChanges[uniqueId].kapali 
              : saat.kapali}
          />
        ) : (
          saat.kapali ? "-" : saat.acilis?.substring(0, 5)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <Input
            type="time"
            defaultValue={saat.kapanis}
            onChange={(e) => onTempChange(uniqueId, 'kapanis', e.target.value)}
            disabled={(tempChanges[uniqueId]?.kapali !== undefined) 
              ? tempChanges[uniqueId].kapali 
              : saat.kapali}
          />
        ) : (
          saat.kapali ? "-" : saat.kapanis?.substring(0, 5)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isStaff ? (
          isEditing ? (
            <Switch
              checked={!((tempChanges[uniqueId]?.kapali !== undefined) 
                ? tempChanges[uniqueId].kapali 
                : saat.kapali)}
              onCheckedChange={(checked) => onTempChange(uniqueId, 'kapali', !checked)}
            />
          ) : (
            <Switch
              checked={!saat.kapali}
              onCheckedChange={(checked) => {
                onTempChange(uniqueId, 'kapali', !checked);
                onSaveChanges(uniqueId);
              }}
            />
          )
        ) : (
          saat.kapali ? "Kapalı" : "Açık"
        )}
      </td>
      {isStaff && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onSaveChanges(uniqueId)}
              >
                Kaydet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancelEditing(uniqueId)}
              >
                İptal
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => onStartEditing(uniqueId)}
            >
              Düzenle
            </Button>
          )}
        </td>
      )}
    </tr>
  );
}
