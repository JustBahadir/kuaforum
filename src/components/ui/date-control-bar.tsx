
import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface DateControlBarProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  onSingleDateChange?: (date: Date) => void;
  onMonthCycleChange?: (day: number, cycleDate: Date) => void;
  className?: string;
  showMonthCycle?: boolean;
}

export function DateControlBar({
  dateRange,
  onDateRangeChange,
  onSingleDateChange,
  onMonthCycleChange,
  className,
  showMonthCycle = true
}: DateControlBarProps) {
  const [useMonthCycle, setUseMonthCycle] = React.useState(false);
  const [monthCycleDay, setMonthCycleDay] = React.useState(1);
  const [dateType, setDateType] = React.useState<"single" | "range">("range");

  const handleMonthCycleChange = (day: number, cycleDate: Date) => {
    setMonthCycleDay(day);
    setUseMonthCycle(true);
    
    if (onMonthCycleChange) {
      onMonthCycleChange(day, cycleDate);
    }
  };

  const handleSingleDateSelect = (date: Date | undefined) => {
    if (date && onSingleDateChange) {
      onSingleDateChange(date);
      // Also update date range for consistency
      onDateRangeChange({ from: date, to: date });
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            <CalendarIcon className="h-4 w-4" />
            {dateType === "single" ? "Tek Gün" : "Tarih Aralığı"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setDateType("single")}>
            Tek Gün
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDateType("range")}>
            Tarih Aralığı
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!useMonthCycle && (
        dateType === "single" ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {format(dateRange.from, "d MMM yyyy", { locale: tr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={handleSingleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <DateRangePicker 
            from={dateRange.from}
            to={dateRange.to}
            onSelect={onDateRangeChange}
          />
        )
      )}

      {showMonthCycle && (
        <CustomMonthCycleSelector 
          selectedDay={monthCycleDay}
          onChange={handleMonthCycleChange}
          active={useMonthCycle}
          onClear={() => setUseMonthCycle(false)}
        />
      )}
    </div>
  );
}
