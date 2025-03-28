
import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  from: Date;
  to: Date;
  onSelect: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({
  className,
  from,
  to,
  onSelect,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: tr })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: tr })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: tr })
              )
            ) : (
              <span>Tarih seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              // Only call onSelect when we have both from and to dates
              if (selectedDate?.from && selectedDate?.to) {
                onSelect({
                  from: selectedDate.from,
                  to: selectedDate.to
                });
              }
            }}
            weekStartsOn={1} // Set week starts on Monday (1) instead of Sunday (0)
            numberOfMonths={2}
            locale={tr}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
