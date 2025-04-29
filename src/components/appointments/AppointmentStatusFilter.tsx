
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RandevuDurumu } from "@/lib/supabase/types";
import { CheckCircle, Clock, XCircle, Calendar } from "lucide-react";

interface AppointmentStatusFilterProps {
  value: RandevuDurumu | 'all';
  onChange: (status: RandevuDurumu | 'all') => void;
}

export function AppointmentStatusFilter({
  value,
  onChange
}: AppointmentStatusFilterProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Randevu Durumu</label>
      <ToggleGroup type="single" value={value} onValueChange={(v) => onChange(v as RandevuDurumu | 'all')}>
        <ToggleGroupItem value="all" aria-label="Hepsi">
          <Calendar className="h-4 w-4 mr-2" />
          Hepsi
        </ToggleGroupItem>
        <ToggleGroupItem value="beklemede" aria-label="Beklemede">
          <Clock className="h-4 w-4 mr-2" />
          Beklemede
        </ToggleGroupItem>
        <ToggleGroupItem value="onaylandi" aria-label="Onaylandı">
          <Calendar className="h-4 w-4 mr-2" />
          Onaylandı
        </ToggleGroupItem>
        <ToggleGroupItem value="tamamlandi" aria-label="Tamamlandı">
          <CheckCircle className="h-4 w-4 mr-2" />
          Tamamlandı
        </ToggleGroupItem>
        <ToggleGroupItem value="iptal_edildi" aria-label="İptal Edildi">
          <XCircle className="h-4 w-4 mr-2" />
          İptal
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
