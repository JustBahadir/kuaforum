
import * as React from "react"
import { format, addMonths, subMonths } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CustomMonthCycleSelectorProps {
  selectedDay: number;
  onChange: (day: number, date: Date) => void;
  active?: boolean;
  onClear?: () => void;
}

export function CustomMonthCycleSelector({
  selectedDay,
  onChange,
  active = false,
  onClear
}: CustomMonthCycleSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const today = new Date();

  const handleDaySelect = (day: number) => {
    const date = new Date();
    date.setDate(day);
    onChange(day, date);
    setOpen(false);
  };

  // Create array of days 1-31 for the selector
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={active ? "secondary" : "outline"}
          size="sm"
          className="h-9 justify-start gap-1 whitespace-nowrap"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>
            {active 
              ? `Özel Döngü: ${selectedDay}. Gün` 
              : "Özel Ay Döngüsü"}
          </span>
          {active && onClear && (
            <X 
              className="h-3 w-3 ml-1 opacity-70 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="text-sm font-medium">Ay Döngüsü Başlangıç Günü</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Her ayın hangi gününden başlayarak raporlar gösterilsin?
          </p>
        </div>
        <ScrollArea className="h-72 py-3">
          <div className="grid grid-cols-5 gap-2 p-3">
            {days.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "secondary" : "outline"}
                className={cn(
                  "h-9 w-9 p-0",
                  selectedDay === day && "font-bold"
                )}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
