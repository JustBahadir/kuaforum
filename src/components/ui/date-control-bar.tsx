
import * as React from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";

interface DateControlBarProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  onSingleDateChange?: (date: Date) => void;
  onMonthCycleChange?: (day: number, cycleDate: Date) => void;
  className?: string;
}

export function DateControlBar({
  dateRange,
  onDateRangeChange,
  onSingleDateChange,
  onMonthCycleChange,
  className,
}: DateControlBarProps) {
  const [isRangeMode, setIsRangeMode] = React.useState(true);
  const [useMonthCycle, setUseMonthCycle] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState(1);

  const handleSingleDateSelect = (date: Date | undefined) => {
    if (date) {
      if (onSingleDateChange) {
        onSingleDateChange(date);
      }
      
      // For single day mode, we set the range to start at beginning of day and end at end of day
      // This ensures we capture all events for the entire day
      onDateRangeChange({ 
        from: startOfDay(date), 
        to: endOfDay(date) 
      });
    }
  };

  const handleModeToggle = () => {
    setIsRangeMode(!isRangeMode);
    setUseMonthCycle(false);
    
    if (isRangeMode) {
      // Switching to single day mode - use startOfDay and endOfDay for the current from date
      const singleDate = dateRange.from;
      onDateRangeChange({ 
        from: startOfDay(singleDate),
        to: endOfDay(singleDate) 
      });
    }
  };
  
  const handleMonthCycleSelect = (day: number, date: Date) => {
    setSelectedDay(day);
    setUseMonthCycle(true);
    if (onMonthCycleChange) {
      onMonthCycleChange(day, date);
    }
  };
  
  const handleClearMonthCycle = () => {
    setUseMonthCycle(false);
    setIsRangeMode(true);
    onDateRangeChange({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date()
    });
  };

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      <Toggle
        pressed={!isRangeMode}
        onPressedChange={handleModeToggle}
        className="flex gap-2 data-[state=on]:bg-purple-100"
      >
        <CalendarIcon className="h-4 w-4" />
        <span>{isRangeMode ? "Tarih Aralığı" : "Tek Gün"}</span>
      </Toggle>

      {!useMonthCycle && (
        isRangeMode ? (
          <DateRangePicker 
            from={dateRange.from}
            to={dateRange.to}
            onSelect={onDateRangeChange}
          />
        ) : (
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
        )
      )}

      <CustomMonthCycleSelector 
        onChange={handleMonthCycleSelect}
        selectedDay={selectedDay}
        active={useMonthCycle}
        onClear={handleClearMonthCycle}
      />
    </div>
  );
}
