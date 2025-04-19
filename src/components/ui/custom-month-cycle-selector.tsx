
import React, { useState } from "react";
import { CalendarRange, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { addMonths, startOfDay, endOfDay, setDate } from "date-fns";

interface CustomMonthCycleSelectorProps {
  onChange: (day: number, date: Date) => void;
  selectedDay: number;
  active?: boolean;
  onClear?: () => void;
}

export function CustomMonthCycleSelector({
  onChange,
  selectedDay,
  active = false,
  onClear
}: CustomMonthCycleSelectorProps) {
  const [open, setOpen] = useState(false);

  // Generate grid of days (6x5 = 30 days)
  const generateDaysGrid = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const grid = [];
    
    for (let i = 0; i < days.length; i += 7) {
      grid.push(days.slice(i, i + 7));
    }
    
    return grid;
  };

  const handleDaySelect = (day: number) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get date for previous month with selected day
    const prevMonthDate = new Date(currentYear, currentMonth - 1, day);
    
    // Get date for current month with selected day
    const currentMonthDate = setDate(new Date(), day);
    
    // If selected day is in the future, use previous month's date instead
    const cycleStartDate = currentMonthDate > today
      ? prevMonthDate
      : currentMonthDate;
    
    // Calculate cycle end date (same day next month)
    const cycleEndDate = addMonths(cycleStartDate, 1);
    
    // Create date range from start of day to end of day
    const dateRange = {
      from: startOfDay(cycleStartDate),
      to: endOfDay(cycleEndDate)
    };
    
    onChange(day, cycleStartDate);
    setOpen(false);
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={active ? "default" : "outline"} 
              className={cn(
                "flex items-center gap-2",
                active && "bg-purple-600 hover:bg-purple-700 text-white"
              )}
              onClick={() => setOpen(!open)}
            >
              <CalendarRange className="h-4 w-4" />
              <span>Özel Ay Döngüsü</span>
              {active && (
                <Badge 
                  variant="outline" 
                  className="ml-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {selectedDay}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Ay döngüsünü başlatmak için bir gün seçin</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Ay döngüsü başlangıç günü</h4>
              {active && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    if (onClear) onClear();
                    setOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateDaysGrid().flat().map((day) => (
                day && day <= 31 && (
                  <Button
                    key={day}
                    variant={day === selectedDay ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8 p-0 text-sm",
                      day === selectedDay && "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                    onClick={() => handleDaySelect(day)}
                  >
                    {day}
                  </Button>
                )
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Seçilen gün, her ay için döngü başlangıcı olarak kullanılacak
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
