
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export interface DateRangeControlsProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  currentView?: "daily" | "weekly" | "monthly" | "yearly";
}

export function DateRangeControls({ dateRange, setDateRange, currentView }: DateRangeControlsProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "PPP", { locale: tr })} -{" "}
                  {format(dateRange.to, "PPP", { locale: tr })}
                </>
              ) : (
                format(dateRange.from, "PPP", { locale: tr })
              )
            ) : (
              <span>Tarih Seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={setDateRange as any}
            locale={tr}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      
      {currentView === "daily" && (
        <div className="text-sm text-muted-foreground">
          Günlük ayrıntılı istatistikler için tarih seçin
        </div>
      )}
      
      {currentView === "monthly" && (
        <div className="text-sm text-muted-foreground">
          Aylık performans istatistikleri gösteriliyor
        </div>
      )}
    </div>
  );
}
