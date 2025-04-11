import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  RotateCcw,
  RefreshCcw
} from "lucide-react";

interface DateRangeControlsProps {
  period: string;
  setPeriod: (period: string) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  customMonthDay?: number;
  setCustomMonthDay?: (day: number) => void;
  onRefresh?: () => void;
}

export function DateRangeControls({
  period,
  setPeriod,
  dateRange,
  setDateRange,
  customMonthDay,
  setCustomMonthDay,
  onRefresh
}: DateRangeControlsProps) {
  const [showCustomMonthSettings, setShowCustomMonthSettings] = useState(false);
  
  // Handle setting a custom monthly period based on a specific day
  const handleApplyCustomMonth = () => {
    if (!customMonthDay || !setCustomMonthDay) return;
    
    const today = new Date();
    let startDay: Date;
    let endDay: Date;
    
    // Current month's custom day
    const customDayThisMonth = new Date(today.getFullYear(), today.getMonth(), customMonthDay);
    
    // If today is before the custom day of this month, 
    // the period is from previous month's custom day to this month's custom day
    if (today.getDate() < customMonthDay) {
      startDay = new Date(today.getFullYear(), today.getMonth() - 1, customMonthDay);
      endDay = new Date(today.getFullYear(), today.getMonth(), customMonthDay - 1);
    } 
    // Otherwise, the period is from this month's custom day to next month's custom day
    else {
      startDay = new Date(today.getFullYear(), today.getMonth(), customMonthDay);
      endDay = new Date(today.getFullYear(), today.getMonth() + 1, customMonthDay - 1);
    }
    
    setDateRange({ from: startDay, to: endDay });
    setPeriod('custom');
  };
  
  // Function to set default date ranges based on period
  const handlePeriodChange = (newPeriod: string) => {
    const now = new Date();
    let from: Date = new Date();
    let to: Date = new Date();
    
    switch(newPeriod) {
      case 'daily':
        // Today
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'weekly':
        // Last 7 days
        from = new Date();
        from.setDate(now.getDate() - 6);
        to = new Date(now);
        break;
      case 'monthly':
        // Current month
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearly':
        // Current year
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        // Keep existing date range for custom
        return setPeriod(newPeriod);
    }
    
    setDateRange({ from, to });
    setPeriod(newPeriod);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center space-x-2">
          <Select
            value={period}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zaman aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
              <SelectItem value="custom">Özel Aralık</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowCustomMonthSettings(!showCustomMonthSettings)}
            title="Özel ay döngüsü"
          >
            <CalendarRange className="h-4 w-4" />
          </Button>
          
          {onRefresh && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRefresh}
              title="Verileri yenile"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={({ from, to }) => {
              if (from && to) {
                setDateRange({ from, to });
                setPeriod('custom');
              }
            }}
          />
        </div>
      </div>
      
      {showCustomMonthSettings && setCustomMonthDay && (
        <div className="p-4 bg-gray-50 rounded-md border">
          <Label className="text-sm font-medium">Özel Ay Döngüsü</Label>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Her ayın hangi gününden başlasın?</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  type="number" 
                  min="1" 
                  max="31" 
                  value={customMonthDay || 1} 
                  onChange={(e) => setCustomMonthDay(parseInt(e.target.value))} 
                  className="w-24"
                />
                <span className="text-sm">günü başlangıç</span>
                <Button 
                  size="sm" 
                  onClick={handleApplyCustomMonth}
                >
                  Uygula
                </Button>
              </div>
            </div>
            <div className="hidden md:block text-sm text-gray-500">
              <p>Örnek: "15" seçerseniz, fatura döneminiz her ayın 15'inden sonraki ayın 14'üne kadar olacaktır.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
