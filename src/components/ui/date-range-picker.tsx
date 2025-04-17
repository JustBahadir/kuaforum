
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

interface DateRangePickerProps {
  className?: string
  from: Date
  to: Date
  onSelect: (range: { from: Date; to: Date }) => void
  singleDate?: boolean
  align?: "start" | "center" | "end"
}

export function DateRangePicker({
  className,
  from,
  to,
  onSelect,
  singleDate = false,
  align = "start"
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  })

  // Update internal state when props change
  React.useEffect(() => {
    setDate({ from, to })
  }, [from, to])

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
              singleDate ? (
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
        <PopoverContent className="w-auto p-0" align={align}>
          {singleDate ? (
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={from}
              selected={from}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  const newRange = { from: selectedDate, to: selectedDate };
                  setDate(newRange);
                  onSelect(newRange);
                }
              }}
              weekStartsOn={1}
              numberOfMonths={1}
              locale={tr}
              className="p-3 pointer-events-auto"
            />
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={from}
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                  onSelect({ 
                    from: selectedDate.from || from, 
                    to: selectedDate.to || selectedDate.from || to 
                  });
                }
              }}
              weekStartsOn={1}
              numberOfMonths={2}
              locale={tr}
              className="p-3 pointer-events-auto"
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
