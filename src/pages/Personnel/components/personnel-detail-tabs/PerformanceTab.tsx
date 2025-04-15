
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicePerformanceView } from "./performance-tabs/ServicePerformanceView";
import { CategoryPerformanceView } from "./performance-tabs/CategoryPerformanceView";
import { DateRangePicker } from "@/components/ui/date-range-picker";

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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-2">
        <div className="flex items-center gap-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={setDateRange}
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
          <span className="text-xs text-muted-foreground">Son 30 gün</span>
        </div>
        <ul className="space-y-2 pl-2" key={refreshKey}>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span className="text-sm">
              {personnel.ad_soyad} son 30 günde toplam {personnel.islem_sayisi || 0} işlem gerçekleştirdi 
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

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">
            {activeView === "hizmet" ? "Hizmet Bazlı Değerlendirme" : "Kategori Bazlı Değerlendirme"}
          </h3>
          <div className="flex space-x-2">
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
