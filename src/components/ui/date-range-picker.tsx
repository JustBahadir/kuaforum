
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
  singleDate?: boolean;
}

export function DateRangePicker({
  className,
  from,
  to,
  onSelect,
  singleDate = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange>({
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
              singleDate ? (
                format(date.from, "LLL dd, y", { locale: tr })
              ) : (
                <>
                  {format(date.from, "LLL dd, y", { locale: tr })} -{" "}
                  {format(date.to || date.from, "LLL dd, y", { locale: tr })}
                </>
              )
            ) : (
              <span>Tarih seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode={singleDate ? "single" : "range"}
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selectedDate) => {
              if (!selectedDate) return;
              
              if (singleDate) {
                const singleDateValue = {
                  from: selectedDate as Date,
                  to: selectedDate as Date
                };
                setDate(singleDateValue);
                onSelect(singleDateValue);
              } else if ('from' in selectedDate && selectedDate.from && selectedDate.to) {
                setDate(selectedDate);
                onSelect({
                  from: selectedDate.from,
                  to: selectedDate.to
                });
              } else {
                setDate(selectedDate as DateRange);
              }
            }}
            weekStartsOn={1}
            numberOfMonths={2}
            locale={tr}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
