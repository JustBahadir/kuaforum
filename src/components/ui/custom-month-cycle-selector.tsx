
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
  const [open, setOpen] = useState(false);

  const handleDayChange = (day: number) => {
    const date = new Date();
    date.setDate(day);
    onChange(day, date);
    setOpen(false);
  };

  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        <PopoverTrigger asChild>
          <Button
            variant={active ? "secondary" : "outline"}
            className={cn(
              "justify-between text-sm",
              active && "font-medium"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="ml-2">Özel Ay Döngüsü</span>
          </Button>
        </PopoverTrigger>
        
        {active && onClear && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <PopoverContent className="w-auto p-0 min-w-[240px]" align="start">
        <div className="p-3">
          <div className="font-medium text-sm mb-1">Ayın gününü seçin</div>
          <p className="text-xs text-muted-foreground mb-3">
            Seçilen günden başlayarak aylık döngü hesaplanacak
          </p>
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  day === today && selectedDay !== day && "border-primary text-primary"
                )}
                onClick={() => handleDayChange(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
        {active && (
          <div className="bg-muted/50 p-3 text-xs border-t">
            <div className="font-medium">Aktif döngü</div>
            <div className="flex items-center justify-between mt-1">
              <div>
                Her ayın {selectedDay}. günü
                <span className="block text-muted-foreground mt-1">
                  {format(new Date(), "MMMM yyyy", { locale: tr })}
                </span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
