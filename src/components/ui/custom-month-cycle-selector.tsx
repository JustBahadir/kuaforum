
import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, getDaysInMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "./badge";

interface CustomMonthCycleProps {
  selectedDay: number;
  onChange: (day: number, date: Date) => void;
  active: boolean;
  onClear: () => void;
  className?: string;
}

export function CustomMonthCycleSelector({
  selectedDay = 1,
  onChange,
  active = false,
  onClear,
  className,
}: CustomMonthCycleProps) {
  const [open, setOpen] = React.useState(false);
  const today = new Date();
  const daysInMonth = React.useMemo(() => getDaysInMonth(today), [today]);
  
  const days = React.useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const handleSelect = (day: number) => {
    const date = new Date();
    date.setDate(day);
    onChange(day, date);
    setOpen(false);
  };

  // Determine the month range to display
  const displayDate = React.useMemo(() => {
    const startDate = new Date();
    startDate.setDate(selectedDay);
    
    if (today.getDate() < selectedDay) {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    return {
      start: format(startDate, "d MMMM", { locale: tr }),
      end: format(endDate, "d MMMM", { locale: tr })
    };
  }, [selectedDay, today]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={active ? "default" : "outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              active && "bg-primary text-primary-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {active ? (
              <span>
                {displayDate.start} - {displayDate.end}
              </span>
            ) : (
              <span>Özel Ay Döngüsü</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="mb-2 text-sm font-medium">
              Ay döngüsü başlangıç günü seçin
            </div>
            <div className="flex flex-wrap gap-1 max-w-[240px]">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() => handleSelect(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {active && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
