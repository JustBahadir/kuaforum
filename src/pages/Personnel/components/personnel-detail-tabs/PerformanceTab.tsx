
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicePerformanceView } from "./performance-tabs/ServicePerformanceView";
import { CategoryPerformanceView } from "./performance-tabs/CategoryPerformanceView";

interface PerformanceTabProps {
  personnel: any;
}

export function PerformanceTab({ personnel }: PerformanceTabProps) {
  const [activeTab, setActiveTab] = useState("hizmet");
  
  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 bg-muted/30">
        <h3 className="font-medium mb-2">Akıllı Analiz</h3>
        <ul className="space-y-2 pl-2">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="hizmet">Hizmet Bazlı</TabsTrigger>
            <TabsTrigger value="kategori">Kategori Bazlı</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-muted"
              onClick={() => setActiveTab("hizmet")}
              disabled={activeTab === "hizmet"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-muted"
              onClick={() => setActiveTab("kategori")}
              disabled={activeTab === "kategori"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="hizmet" className="mt-0">
          <ServicePerformanceView personnel={personnel} />
        </TabsContent>
        
        <TabsContent value="kategori" className="mt-0">
          <CategoryPerformanceView personnel={personnel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
