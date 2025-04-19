
import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
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

  const handleMonthCycleChange = (day: number, cycleDate: Date) => {
    setMonthCycleDay(day);
    setUseMonthCycle(true);
    
    if (onMonthCycleChange) {
      onMonthCycleChange(day, cycleDate);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {!useMonthCycle && (
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onSelect={onDateRangeChange}
        />
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
