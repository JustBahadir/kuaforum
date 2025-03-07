
import { CalismaSaati } from '@/lib/supabase/types';

export interface WorkingHoursState {
  editing: number | null;
  tempChanges: Record<number, Partial<CalismaSaati>>;
}

export interface UseWorkingHoursResult {
  calismaSaatleri: CalismaSaati[];
  editing: number | null;
  tempChanges: Record<number, Partial<CalismaSaati>>;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  startEditing: (id: number) => void;
  handleTempChange: (id: number, field: keyof CalismaSaati, value: any) => void;
  saveChanges: (id: number) => Promise<void>;
  cancelEditing: (id: number) => void;
  handleStatusToggle: (id: number, isOpen: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}
