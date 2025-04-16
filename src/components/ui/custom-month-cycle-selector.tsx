
import React, { useState } from "react";
import { CalendarIcon, XCircle } from "lucide-react";
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
  
  // Generate days for the month cycle selection (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const handleDaySelect = (day: number) => {
    const date = new Date();
    // Set the selected day
    date.setDate(day);
    
    // If current day is past the selected day, use previous month's day
    const currentDay = new Date().getDate();
    if (currentDay < day) {
      date.setMonth(date.getMonth() - 1);
    }
    
    onChange(day, date);
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
              <CalendarIcon className="h-4 w-4" />
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
            <p>Bir aylık döngü için başlangıç günü seçin</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverContent className="w-80 p-2" align="start">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Ay döngüsü başlangıç günü seçin</h4>
              {active && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ay döngüsünü kaldır</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={day === selectedDay ? "default" : "outline"}
                  className={cn(
                    "h-8 w-9 p-0",
                    day === selectedDay && "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                  onClick={() => handleDaySelect(day)}
                >
                  {day}
                </Button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Örnek: 15 seçerseniz, her ayın 15'inden sonraki ayın 15'ine kadar olan dönemi görüntülersiniz.</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
