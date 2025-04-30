
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RandevuDurumu } from "@/lib/supabase/types";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

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
      <ToggleGroup type="single" value={value} onValueChange={(v) => onChange(v as RandevuDurumu | 'all')} className="flex flex-wrap">
        <ToggleGroupItem value="all" aria-label="Hepsi" className="bg-gray-100 data-[state=on]:bg-gray-300">
          <Calendar className="h-4 w-4 mr-2" />
          Hepsi
        </ToggleGroupItem>
        <ToggleGroupItem value="beklemede" aria-label="Beklemede" className="bg-yellow-50 data-[state=on]:bg-yellow-200">
          <Clock className="h-4 w-4 mr-2" />
          Beklemede
        </ToggleGroupItem>
        <ToggleGroupItem value="tamamlandi" aria-label="Tamamlandı" className="bg-green-50 data-[state=on]:bg-green-200">
          <CheckCircle className="h-4 w-4 mr-2" />
          Tamamlandı
        </ToggleGroupItem>
        <ToggleGroupItem value="iptal_edildi" aria-label="İptal Edildi" className="bg-red-50 data-[state=on]:bg-red-200">
          <XCircle className="h-4 w-4 mr-2" />
          İptal
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
