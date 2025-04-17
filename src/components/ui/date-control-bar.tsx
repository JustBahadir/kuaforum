
import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronRight, Settings } from "lucide-react";

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
  initialMode?: 'single' | 'range';
}

export function DateControlBar({
  dateRange,
  onDateRangeChange,
  onSingleDateChange,
  onMonthCycleChange,
  className,
  showMonthCycle = true,
  initialMode = 'range'
}: DateControlBarProps) {
  const [useSingleDate, setUseSingleDate] = React.useState(initialMode === 'single');
  const [monthCycleDay, setMonthCycleDay] = React.useState(1);
  const [useMonthCycle, setUseMonthCycle] = React.useState(false);

  const handleModeToggle = () => {
    setUseSingleDate(!useSingleDate);
    setUseMonthCycle(false);
    
    if (useSingleDate) {
      // Switching from single to range
      onDateRangeChange({
        from: dateRange.from,
        to: new Date()
      });
    } else {
      // Switching from range to single
      if (onSingleDateChange) {
        onSingleDateChange(dateRange.from);
      } else {
        onDateRangeChange({
          from: dateRange.from,
          to: dateRange.from
        });
      }
    }
  };

  const handleSingleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    if (onSingleDateChange) {
      onSingleDateChange(date);
    } else {
      onDateRangeChange({
        from: date,
        to: date
      });
    }
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    onDateRangeChange(range);
  };

  const handleMonthCycleChange = (day: number, cycleDate: Date) => {
    setMonthCycleDay(day);
    setUseMonthCycle(true);
    setUseSingleDate(false);
    
    if (onMonthCycleChange) {
      onMonthCycleChange(day, cycleDate);
    } else {
      const currentDate = new Date();
      let fromDate = new Date();
      
      // Set to previous month's cycle day
      fromDate.setDate(day);
      if (currentDate.getDate() < day) {
        fromDate.setMonth(fromDate.getMonth() - 1);
      }
      
      // Create the end date (same day, current month)
      const toDate = new Date(fromDate);
      toDate.setMonth(toDate.getMonth() + 1);
      
      onDateRangeChange({
        from: fromDate,
        to: toDate
      });
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={useSingleDate ? "default" : "outline"}
              size="sm" 
              onClick={handleModeToggle}
              className={cn(
                "transition-colors",
                useSingleDate && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {useSingleDate ? "Tek Gün" : "Tarih Aralığı"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tek gün veya tarih aralığı seçim modunu değiştir</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {useSingleDate ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-grow sm:flex-grow-0 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                format(dateRange.from, "dd MMM yyyy", { locale: tr })
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.from}
              onSelect={handleSingleDateChange}
              initialFocus
              locale={tr}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      ) : !useMonthCycle && (
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onSelect={handleDateRangeChange}
          className="flex-grow sm:flex-grow-0"
          singleDate={false}
          align="start"
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
