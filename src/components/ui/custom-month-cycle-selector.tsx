
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarRange, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomMonthCycleSelectorProps {
  selectedDay: number;
  onChange: (day: number) => void;
  active?: boolean;
  onClear?: () => void;
}

export function CustomMonthCycleSelector({
  selectedDay = 1,
  onChange,
  active = false,
  onClear
}: CustomMonthCycleSelectorProps) {
  const [day, setDay] = useState(selectedDay);
  const [isOpen, setIsOpen] = useState(false);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 31) {
      setDay(value);
    }
  };

  const handleApply = () => {
    onChange(day);
    setIsOpen(false);
  };

  const handleClear = () => {
    if (onClear) onClear();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={active ? "default" : "outline"} 
          size="sm"
          className={cn("flex items-center gap-1", active && "bg-purple-600 hover:bg-purple-700")}
        >
          <CalendarRange className="h-4 w-4" />
          <span>Özel Ay Döngüsü</span>
          {active && (
            <span className="bg-white text-purple-600 rounded-full px-1 text-xs ml-1">
              {selectedDay}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Özel Ay Döngüsü</h4>
            <p className="text-xs text-muted-foreground">
              Her ayın belirli bir gününden başlayarak bir sonraki aya kadar olan tarihleri seçin.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthCycleDay" className="text-xs">Her ayın hangi gününden başlasın?</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="monthCycleDay"
                type="number" 
                min="1" 
                max="31" 
                value={day} 
                onChange={handleDayChange}
                className="w-16 text-center"
              />
              <span className="text-sm">günü başlangıç</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Örnek: "{day}" seçerseniz, dönem her ayın {day}'inden sonraki ayın {day-1 === 0 ? "son" : day-1}'ine kadar olacaktır.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <X className="h-3.5 w-3.5 mr-1" />
              Temizle
            </Button>
            <Button size="sm" onClick={handleApply}>
              Uygula
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
