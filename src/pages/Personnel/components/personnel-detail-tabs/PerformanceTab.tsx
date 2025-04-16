
import React, { useState, useCallback, useMemo } from "react";
import { ServicePerformanceView } from "./performance-tabs/ServicePerformanceView";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { processServiceData, generateSmartInsights } from "@/utils/performanceUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryPerformanceView } from "./performance-tabs/CategoryPerformanceView";

interface PerformanceTabProps {
  personnel: any;
  operations: any[];
  isLoading?: boolean;
}

export function PerformanceTab({ 
  personnel, 
  operations = [],
  isLoading = false 
}: PerformanceTabProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const [useSingleDate, setUseSingleDate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState<"services" | "categories">("services");

  // Extract all dates that have operations
  const availableDates = useMemo(() => {
    if (!operations || operations.length === 0) return [];
    return operations
      .filter(op => op && op.created_at)
      .map(op => new Date(op.created_at))
      .sort((a, b) => a.getTime() - b.getTime());
  }, [operations]);

  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
    setUseSingleDate(false);
  };

  const handleSingleDateChange = (date: Date | undefined) => {
    if (date) {
      setDateRange({from: date, to: date});
      setUseMonthCycle(false);
      setUseSingleDate(true);
    }
  };

  const handleMonthCycleChange = (day: number) => {
    setMonthCycleDay(day);
    
    const currentDate = new Date();
    const selectedDay = day;
    
    let fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    if (currentDate.getDate() < selectedDay) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    toDate.setDate(toDate.getDate() - 1);
    
    setDateRange({from: fromDate, to: toDate});
    setUseMonthCycle(true);
    setUseSingleDate(false);
  };

  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      if (!op || !op.created_at) return false;
      const date = new Date(op.created_at);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [operations, dateRange.from, dateRange.to]);

  const serviceData = useMemo(() => {
    return processServiceData(filteredOperations);
  }, [filteredOperations]);
  
  const insights = useMemo(() => {
    return generateSmartInsights(filteredOperations, serviceData);
  }, [filteredOperations, serviceData]);

  const toggleDateSelector = () => {
    setUseSingleDate(!useSingleDate);
    if (!useSingleDate) {
      // When switching to single date mode, set both dates to the "from" date
      setDateRange(prev => ({from: prev.from, to: prev.from}));
    } else {
      // When switching back to range mode, set the "to" date to today
      setDateRange(prev => ({from: prev.from, to: new Date()}));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {!useMonthCycle && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={useSingleDate ? "default" : "outline"}
                    size="sm"
                    onClick={toggleDateSelector}
                    className={cn(useSingleDate && "bg-purple-600 hover:bg-purple-700")}
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{useSingleDate ? "Tarih Aralığı" : "Tek Gün"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{useSingleDate ? "Tarih aralığı seç" : "Tek gün seç"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {useSingleDate ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.from.toLocaleDateString()
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          ) : !useMonthCycle && (
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onSelect={handleDateRangeChange}
            />
          )}
          
          <CustomMonthCycleSelector 
            selectedDay={monthCycleDay}
            onChange={handleMonthCycleChange}
            active={useMonthCycle}
            onClear={() => setUseMonthCycle(false)}
          />
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{dateRange.from.toLocaleDateString('tr-TR')}</span>
          {!useSingleDate && (
            <>
              <span> - </span>
              <span>{dateRange.to.toLocaleDateString('tr-TR')}</span>
            </>
          )}
        </div>
      </div>

      <Tabs 
        value={activeView} 
        onValueChange={(value) => setActiveView(value as "services" | "categories")}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="services">Hizmet Raporları</TabsTrigger>
          <TabsTrigger value="categories">Kategori Raporları</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ServicePerformanceView
              serviceData={serviceData}
              insights={insights}
              refreshAnalysis={() => setRefreshKey(prev => prev + 1)}
              dateRange={dateRange}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <CategoryPerformanceView 
              dateRange={dateRange} 
              refreshKey={refreshKey}
              operations={filteredOperations}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
