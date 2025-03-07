
import { useState } from 'react';
import { CalismaSaati } from '@/lib/supabase/types';

export function useWorkingHoursState() {
  const [editing, setEditing] = useState<number | null>(null);
  const [tempChanges, setTempChanges] = useState<Record<number, Partial<CalismaSaati>>>({});

  const startEditing = (id: number) => {
    setEditing(id);
    setTempChanges(prev => ({
      ...prev,
      [id]: {}
    }));
  };

  const handleTempChange = (id: number, field: keyof CalismaSaati, value: any) => {
    setTempChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const cancelEditing = (id: number) => {
    setEditing(null);
    setTempChanges(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
  };

  const clearEditingState = (id: number) => {
    cancelEditing(id);
  };

  return {
    editing,
    tempChanges,
    startEditing,
    handleTempChange,
    cancelEditing,
    clearEditingState
  };
}
