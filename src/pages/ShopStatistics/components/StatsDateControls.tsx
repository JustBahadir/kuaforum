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
import { CalendarRange, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsDateControlsProps {
  period: string;
  setPeriod: (period: string) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  customMonthDay: number;
  setCustomMonthDay: (day: number) => void;
  useMonthCycle: boolean;
  setUseMonthCycle: (use: boolean) => void;
  onRefresh?: () => void;
}

export function StatsDateControls({
  period,
  setPeriod,
  dateRange,
  setDateRange,
  customMonthDay,
  setCustomMonthDay,
  useMonthCycle,
  setUseMonthCycle,
  onRefresh
}: StatsDateControlsProps) {
  const [showCustomMonthSettings, setShowCustomMonthSettings] = useState(false);
  
  // Handle setting a custom monthly period based on a specific day
  const handleApplyCustomMonth = () => {
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
    setUseMonthCycle(true);
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
        setPeriod(newPeriod);
        return;
    }
    
    setDateRange({ from, to });
    setPeriod(newPeriod);
    setUseMonthCycle(false);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4 pt-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-2">
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
                className={showCustomMonthSettings ? "bg-primary/10" : ""}
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

              {useMonthCycle && (
                <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  Özel Ay Döngüsü: Her ayın {customMonthDay}. günü
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 ml-2" 
                    onClick={() => setUseMonthCycle(false)}
                  >
                    Kaldır
                  </Button>
                </div>
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
                    setUseMonthCycle(false);
                  }
                }}
              />
            </div>
          </div>
          
          {showCustomMonthSettings && (
            <div className="p-4 bg-muted/50 rounded-md border">
              <Label className="text-sm font-medium">Özel Ay Döngüsü</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Her ayın hangi gününden başlasın?</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      min="1" 
                      max="31" 
                      value={customMonthDay} 
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
                <div className="hidden md:block text-sm text-muted-foreground">
                  <p>Örnek: "15" seçerseniz, fatura döneminiz her ayın 15'inden sonraki ayın 14'üne kadar olacaktır.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
