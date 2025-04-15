
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicePerformanceView } from "./performance-tabs/ServicePerformanceView";
import { CategoryPerformanceView } from "./performance-tabs/CategoryPerformanceView";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from "date-fns";

interface PerformanceTabProps {
  personnel: any;
}

export function PerformanceTab({ personnel }: PerformanceTabProps) {
  const [activeView, setActiveView] = useState("hizmet");
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Date range state
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: subMonths(today, 1),
    to: today
  });
  
  // Custom month cycle
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [cycleActive, setCycleActive] = useState(false);
  
  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setCycleActive(false);
    setSelectedDay(null);
  };
  
  // Handle custom month cycle selection
  const handleCycleDaySelect = (day: number, date: Date) => {
    setSelectedDay(day);
    setCycleActive(true);
    
    // Calculate date range based on selected day
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    
    let from: Date, to: Date;
    
    if (currentDay >= day) {
      // If today is after or on the cycle day, cycle is current month to next month
      from = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day - 1);
    } else {
      // If today is before the cycle day, cycle is previous month to this month
      from = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      to = new Date(currentDate.getFullYear(), currentDate.getMonth(), day - 1);
    }
    
    setDateRange({ from, to });
  };
  
  // Clear cycle selection
  const handleClearCycle = () => {
    setCycleActive(false);
    setSelectedDay(null);
    setDateRange({
      from: subMonths(today, 1),
      to: today
    });
  };
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handlePrevClick = () => {
    setActiveView("hizmet");
    setPageIndex(0);
  };
  
  const handleNextClick = () => {
    setActiveView("kategori");
    setPageIndex(1);
  };
  
  useEffect(() => {
    // Reset to first page when data changes
    setPageIndex(0);
    setActiveView("hizmet");
  }, [refreshKey]);
  
  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 bg-muted/30">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Akıllı Analiz</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-7 gap-1"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Yenile
          </Button>
        </div>
        <ul className="space-y-2 pl-2" key={`analysis-${refreshKey}`}>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span className="text-sm">
              {personnel.ad_soyad} son {dateRange.from && dateRange.to ? 
                `${format(dateRange.from, 'dd MMM')} - ${format(dateRange.to, 'dd MMM')} aralığında` : 
                '30 günde'} toplam {personnel.islem_sayisi || 0} işlem gerçekleştirdi 
              ve {personnel.toplam_ciro ? `₺${personnel.toplam_ciro.toLocaleString('tr-TR')}` : '₺0'} ciro oluşturdu.
            </span>
          </li>
          {personnel.en_cok_islem && (
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-sm">
                En çok yapılan işlem "{personnel.en_cok_islem}" olarak görülüyor.
              </span>
            </li>
          )}
          {personnel.islem_sayisi > 0 && personnel.toplam_ciro > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-sm">
                Bu personelin işlem başına ortalama geliri: 
                {personnel.toplam_ciro && personnel.islem_sayisi 
                  ? `₺${(personnel.toplam_ciro / personnel.islem_sayisi).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                  : '₺0'}
              </span>
            </li>
          )}
          {personnel.en_cok_kategori && (
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-sm">
                En çok performans gösterdiği kategori: {personnel.en_cok_kategori}
              </span>
            </li>
          )}
        </ul>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={handleDateRangeChange}
          className="flex-grow"
        />
        <CustomMonthCycleSelector
          selectedDay={selectedDay || 1}
          onChange={handleCycleDaySelect}
          active={cycleActive}
          onClear={handleClearCycle}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">
            {activeView === "hizmet" ? "Hizmet Bazlı Değerlendirme" : "Kategori Bazlı Değerlendirme"}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant={activeView === "hizmet" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8"
              onClick={handlePrevClick}
            >
              Hizmet
            </Button>
            <Button 
              variant={activeView === "kategori" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={handleNextClick}
            >
              Kategori
            </Button>

            <div className="ml-2 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-muted"
                onClick={handlePrevClick}
                disabled={activeView === "hizmet"}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                onClick={handleNextClick}
                disabled={activeView === "kategori"}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="text-xs text-muted-foreground ml-1">
                {pageIndex + 1}/2
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out" 
            style={{ transform: `translateX(-${pageIndex * 100}%)`, width: '200%' }}
          >
            <div className="w-full flex-shrink-0">
              <ServicePerformanceView 
                personnel={personnel} 
                dateRange={dateRange}
                key={`service-${refreshKey}`}
              />
            </div>
            <div className="w-full flex-shrink-0">
              <CategoryPerformanceView 
                personnel={personnel} 
                dateRange={dateRange}
                key={`category-${refreshKey}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
