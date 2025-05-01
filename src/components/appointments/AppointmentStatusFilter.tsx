
import { Button } from "../ui/button";
import { RandevuDurumu } from "@/lib/supabase/types";
import { ButtonGroup } from "../ui/button-group";

interface AppointmentStatusFilterProps {
  value: RandevuDurumu | 'all';
  onChange: (value: RandevuDurumu | 'all') => void;
}

export function AppointmentStatusFilter({ value, onChange }: AppointmentStatusFilterProps) {
  return (
    <div>
      <h2 className="text-sm font-medium mb-3">Randevu Durumu</h2>
      <ButtonGroup>
        <Button 
          variant={value === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => onChange('all')}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Hepsi</span>
        </Button>
        
        <Button 
          variant={value === 'beklemede' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => onChange('beklemede')}
          className="flex items-center gap-2"
        >
          <span className="rounded-full w-2 h-2 bg-yellow-500"></span>
          <span className="hidden sm:inline">Beklemede</span>
        </Button>
        
        <Button 
          variant={value === 'tamamlandi' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => onChange('tamamlandi')}
          className="flex items-center gap-2"
        >
          <span className="rounded-full w-2 h-2 bg-green-500"></span>
          <span className="hidden sm:inline">Tamamlandı</span>
        </Button>
        
        <Button 
          variant={value === 'iptal_edildi' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => onChange('iptal_edildi')}
          className="flex items-center gap-2"
        >
          <span className="rounded-full w-2 h-2 bg-red-500"></span>
          <span className="hidden sm:inline">İptal</span>
        </Button>
      </ButtonGroup>
    </div>
  );
}
