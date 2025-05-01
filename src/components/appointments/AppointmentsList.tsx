
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RandevuDurumu } from '@/lib/supabase/types';

interface AppointmentsListFilterProps {
  onFilterChange?: (status: RandevuDurumu | 'all') => void;
  defaultValue?: RandevuDurumu | 'all';
}

export const AppointmentsListFilter: React.FC<AppointmentsListFilterProps> = ({ 
  onFilterChange,
  defaultValue = 'all'
}) => {
  const [statusFilter, setStatusFilter] = useState<RandevuDurumu | 'all'>(defaultValue);

  const handleStatusChange = (value: RandevuDurumu | 'all') => {
    setStatusFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  return (
    <Select 
      value={statusFilter} 
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Durum Filtrele" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tüm Durumlar</SelectItem>
        <SelectItem value="beklemede">Beklemede</SelectItem>
        <SelectItem value="iptal_edildi">İptal Edildi</SelectItem>
        <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
      </SelectContent>
    </Select>
  );
};
