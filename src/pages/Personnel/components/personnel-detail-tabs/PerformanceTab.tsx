
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicePerformanceView } from "./performance-tabs/ServicePerformanceView";
import { CategoryPerformanceView } from "./performance-tabs/CategoryPerformanceView";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
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
  };

  // Create smart analysis texts with variety
  const generateSmartAnalysis = () => {
    const mockAnalysis = [
      `${personnel.ad_soyad} son 30 günde toplam ${personnel.islem_sayisi || 0} işlem gerçekleştirdi ve ${personnel.toplam_ciro ? `₺${personnel.toplam_ciro.toLocaleString('tr-TR')}` : '₺0'} ciro oluşturdu.`,
      `En çok yapılan işlem "${personnel.en_cok_islem || 'Saç Kesimi'}" olarak görülüyor.`,
      `Bu personelin işlem başına ortalama geliri: ${personnel.toplam_ciro && personnel.islem_sayisi ? `₺${(personnel.toplam_ciro / personnel.islem_sayisi).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '₺0'}`,
      `En çok performans gösterdiği kategori: ${personnel.en_cok_kategori || 'Saç Hizmeti'}`,
      `${personnel.ad_soyad} en verimli gününü ${new Date().toLocaleDateString('tr-TR')} tarihinde ${personnel.toplam_ciro ? (personnel.toplam_ciro * 0.15).toFixed(2) : 0} ₺ ciro ile gerçekleştirdi.`,
      `${personnel.ad_soyad}'in müşteri memnuniyet puanı ortalama 4.7/5.`,
      `En popüler hizmet kombinasyonu: ${personnel.en_cok_islem || 'Saç Kesimi'} + Fön`,
      `${personnel.ad_soyad}, seçilen tarih aralığında günde ortalama ${personnel.islem_sayisi ? Math.round((personnel.islem_sayisi / 30) * 10) / 10 : 0} işlem yapmıştır.`
    ];
    
    // Randomly select 3 different analysis items
    return mockAnalysis
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  };

  const [smartAnalysis, setSmartAnalysis] = useState<string[]>([]);
  
  useEffect(() => {
    setSmartAnalysis(generateSmartAnalysis());
  }, [refreshKey, personnel.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <span className="hidden md:inline">Tarih Aralığı</span>
          </Button>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={handleDateRangeChange}
          />
          <CustomMonthCycleSelector 
            selectedDay={monthCycleDay}
            onChange={handleMonthCycleChange}
            active={useMonthCycle}
            onClear={() => setUseMonthCycle(false)}
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            title="Analizleri yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Akıllı Analiz</h3>
          <span className="text-xs text-muted-foreground">
            {dateRange.from.toLocaleDateString('tr-TR')} - {dateRange.to.toLocaleDateString('tr-TR')}
          </span>
        </div>
        <ul className="space-y-2 pl-2" key={refreshKey}>
          {smartAnalysis.map((analysis, index) => (
            <li className="flex items-start gap-2" key={index}>
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-sm">{analysis}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2 border-b pb-2">
          <h3 className="font-medium">
            {activeView === "hizmet" ? "Hizmet Bazlı Değerlendirme" : "Kategori Bazlı Değerlendirme"}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 hover:bg-muted", pageIndex === 0 && "text-primary")}
              onClick={handlePrevClick}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn("h-8 w-8 hover:bg-muted", pageIndex === 1 && "text-primary")}
              onClick={handleNextClick}
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
