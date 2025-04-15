
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicePerformanceView } from "./performance-tabs/ServicePerformanceView";
import { CategoryPerformanceView } from "./performance-tabs/CategoryPerformanceView";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";

interface PerformanceTabProps {
  personnel: any;
}

export function PerformanceTab({ personnel }: PerformanceTabProps) {
  const [activeView, setActiveView] = useState("hizmet");
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const [useSingleDate, setUseSingleDate] = useState(false);
  
  const handlePrevClick = () => {
    setActiveView("hizmet");
    setPageIndex(0);
  };
  
  const handleNextClick = () => {
    setActiveView("kategori");
    setPageIndex(1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
    setUseSingleDate(false);
  };

  const handleSingleDateChange = ({from, to}: {from: Date, to: Date}) => {
    // For single date selection, both from and to will be the same date
    setDateRange({from, to: from});
    setUseMonthCycle(false);
    setUseSingleDate(true);
  };

  const handleMonthCycleChange = (day: number, date: Date) => {
    setMonthCycleDay(day);
    
    const currentDate = new Date();
    const selectedDay = day;
    
    let fromDate = new Date();
    
    // Set to previous month's cycle day
    fromDate.setDate(selectedDay);
    if (currentDate.getDate() < selectedDay) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    // Create the end date (same day, current month)
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    
    setDateRange({
      from: fromDate,
      to: toDate
    });
    
    setUseMonthCycle(true);
    setUseSingleDate(false);
  };

  const mockSmartAnalysis = [
    `${personnel.ad_soyad} son 30 günde toplam ${personnel.islem_sayisi || 0} işlem gerçekleştirdi ve ${personnel.toplam_ciro ? `₺${personnel.toplam_ciro.toLocaleString('tr-TR')}` : '₺0'} ciro oluşturdu.`,
    `En çok yapılan işlem "${personnel.en_cok_islem || 'Saç Kesimi'}" olarak görülüyor.`,
    `Bu personelin işlem başına ortalama geliri: ${personnel.toplam_ciro && personnel.islem_sayisi ? `₺${(personnel.toplam_ciro / personnel.islem_sayisi).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '₺0'}`,
    `En çok performans gösterdiği kategori: ${personnel.en_cok_kategori || 'Saç Hizmeti'}`
  ];

  // Create 3 more smart analysis texts for variety
  const extraAnalysis = [
    `${personnel.ad_soyad} en verimli gününü ${new Date().toLocaleDateString('tr-TR')} tarihinde ${personnel.toplam_ciro ? (personnel.toplam_ciro * 0.15).toFixed(2) : 0} ₺ ciro ile gerçekleştirdi.`,
    `${personnel.ad_soyad}'in müşteri memnuniyet puanı ortalama 4.7/5.`,
    `En popüler hizmet kombinasyonu: ${personnel.en_cok_islem || 'Saç Kesimi'} + Fön`
  ];
  
  // Combine all analysis options
  const allAnalysis = [...mockSmartAnalysis, ...extraAnalysis];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {!useSingleDate && !useMonthCycle && (
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onSelect={handleDateRangeChange}
            />
          )}
          
          {!useMonthCycle && !useSingleDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setUseSingleDate(true)}
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Tek Gün</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tek gün seçin</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {useSingleDate && (
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.from}
              onSelect={handleSingleDateChange}
              singleDate={true}
            />
          )}
          
          <CustomMonthCycleSelector 
            selectedDay={monthCycleDay}
            onChange={handleMonthCycleChange}
            active={useMonthCycle}
            onClear={() => setUseMonthCycle(false)}
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analizleri yenile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{dateRange.from.toLocaleDateString('tr-TR')}</span>
          {!useSingleDate && <><span> - </span>
          <span>{dateRange.to.toLocaleDateString('tr-TR')}</span></>}
        </div>
      </div>

      <div className="border rounded-md p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Akıllı Analiz</h3>
        </div>
        <ul className="space-y-2 pl-2" key={refreshKey}>
          {/* Randomly select 3 different analysis items based on refresh key */}
          {allAnalysis
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((analysis, index) => (
              <li className="flex items-start gap-2" key={index}>
                <span className="text-purple-600 font-bold">•</span>
                <span className="text-sm">{analysis}</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">
            {activeView === "hizmet" ? "Hizmet Bazlı Değerlendirme" : "Kategori Bazlı Değerlendirme"}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 hover:bg-muted", pageIndex === 0 && "text-muted-foreground")}
              onClick={handlePrevClick}
              disabled={activeView === "hizmet"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn("h-8 w-8 hover:bg-muted", pageIndex === 1 && "text-muted-foreground")}
              onClick={handleNextClick}
              disabled={activeView === "kategori"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="text-xs text-muted-foreground flex items-center">
              {pageIndex + 1}/2
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
                refreshKey={refreshKey} 
              />
            </div>
            <div className="w-full flex-shrink-0">
              <CategoryPerformanceView 
                personnel={personnel}
                dateRange={dateRange} 
                refreshKey={refreshKey}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import needed at the top but was moved here for formatting
import { CalendarIcon } from "lucide-react";
