
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentHeaderProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export function AppointmentHeader({ currentDate, onPrevious, onNext }: AppointmentHeaderProps) {
  // Format date to include day name, e.g., "3 Mayıs 2025, Cumartesi"
  const formattedDate = format(currentDate, "d MMMM yyyy, EEEE", { locale: tr });
  
  // Capitalize the first letter of each word
  const capitalizedDate = formattedDate
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center min-w-[220px]">
        <Button variant="ghost" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-medium mx-2 whitespace-nowrap">{capitalizedDate}</div>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
