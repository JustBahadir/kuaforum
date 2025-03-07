
import { useState } from 'react';
import { CalismaSaati } from '@/lib/supabase/types';
import { WorkingHoursState } from './types';

/**
 * Hook to manage the working hours editing state
 */
export function useWorkingHoursState(): WorkingHoursState & {
  startEditing: (id: number) => void;
  handleTempChange: (id: number, field: keyof CalismaSaati, value: any) => void;
  cancelEditing: (id: number) => void;
  resetEditingState: (id: number) => void;
} {
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

  const resetEditingState = (id: number) => {
    setEditing(null);
    setTempChanges(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
  };

  return {
    editing,
    tempChanges,
    startEditing,
    handleTempChange,
    cancelEditing,
    resetEditingState
  };
}
