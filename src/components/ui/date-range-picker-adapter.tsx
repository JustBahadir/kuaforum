
import * as React from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import { Dispatch, SetStateAction } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";

interface DatePickerWithRangeProps {
  date: DateRange;
  setDate: Dispatch<SetStateAction<DateRange>>;
  className?: string;
}

export function DatePickerWithRange({ 
  date, 
  setDate,
  className
}: DatePickerWithRangeProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  
  // For mobile, show simplified date picker
  const isMobile = () => window.innerWidth < 640;
  const [isMobileView, setIsMobileView] = React.useState(isMobile());
  
  React.useEffect(() => {
    const handleResize = () => setIsMobileView(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleSelect = (range: DateRange) => {
    // Only update if both dates are selected
    if (range?.from && range?.to) {
      setDate(range);
      if (isMobileView) {
        setIsCalendarOpen(false);
      }
    }
  };
  
  // Format date range for display in button
  const formatDateRange = () => {
    if (!date?.from) return "Tarih aralığı seçin";
    if (!date?.to) return `${format(date.from, "dd MMM", { locale: tr })} - ...`;
    return `${format(date.from, "dd MMM", { locale: tr })} - ${format(date.to, "dd MMM", { locale: tr })}`;
  };
  
  if (isMobileView) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  
  return (
    <DateRangePicker 
      from={date.from}
      to={date.to}
      onSelect={handleSelect}
      className={className}
    />
  );
}
