
import * as React from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DateRangePickerProps {
  className?: string
  from: Date
  to: Date
  onSelect: (range: { from: Date; to: Date }) => void
  singleDate?: boolean
}

export function DateRangePicker({
  className,
  from,
  to,
  onSelect,
  singleDate = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  });
  const [isSingleDate, setIsSingleDate] = React.useState(singleDate);

  // Update internal state when props change
  React.useEffect(() => {
    setDate({ from, to });
    setIsSingleDate(singleDate);
  }, [from, to, singleDate]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    if (!selectedDate) return;
    
    let newRange;
    
    if (isSingleDate && selectedDate.from) {
      // For single date, set both from and to to the same date
      newRange = { 
        from: selectedDate.from, 
        to: selectedDate.from
      };
    } else {
      // For date range, ensure we have both from and to
      newRange = { 
        from: selectedDate.from || from, 
        to: selectedDate.to || (selectedDate.from || to)
      };
    }
    
    setDate(newRange);
    onSelect(newRange);
  };

  const toggleSingleDate = (checked: boolean) => {
    setIsSingleDate(checked);
    
    if (checked && date?.from) {
      // When switching to single date mode, set both from and to to the same date
      const newRange = { from: date.from, to: date.from };
      setDate(newRange);
      onSelect(newRange);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal h-9",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              isSingleDate ? (
                format(date.from, "dd MMM yyyy", { locale: tr })
              ) : (
                <>
                  {format(date.from, "dd MMM yyyy", { locale: tr })} -{" "}
                  {date.to ? format(date.to, "dd MMM yyyy", { locale: tr }) : "..."}
                </>
              )
            ) : (
              <span>Tarih seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm font-medium">Tarih Seçimi</div>
            <div className="flex items-center space-x-2">
              <Switch
                id="single-date-mode"
                checked={isSingleDate}
                onCheckedChange={toggleSingleDate}
                className="h-4 w-7" // Using className instead of size
              />
              <Label htmlFor="single-date-mode" className="text-xs">
                Tek Gün
              </Label>
            </div>
          </div>
          
          {isSingleDate ? (
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={from}
              selected={from}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  handleSelect({ from: selectedDate, to: selectedDate });
                }
              }}
              weekStartsOn={1}
              numberOfMonths={1}
              locale={tr}
            />
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={from}
              selected={date}
              onSelect={handleSelect}
              weekStartsOn={1}
              numberOfMonths={2}
              locale={tr}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
