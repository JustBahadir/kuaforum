
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hizmetler } from "./Hizmetler";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { useQuery } from "@tanstack/react-query";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { KategoriDto } from "@/lib/supabase/types";

export function HizmetYonetimi() {
  const [activeTab, setActiveTab] = useState("hizmetler");
  
  const { data: kategoriler = [] } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: async () => {
      try {
        return await kategoriServisi.hepsiniGetir();
      } catch (error) {
        console.error('Error fetching kategoriler:', error);
        return [];
      }
    },
    staleTime: 60 * 1000 // 1 minute
  });

  return (
    <div className="space-y-4">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hizmetler">Hizmetler</TabsTrigger>
          <TabsTrigger value="calisma-saatleri">Çalışma Saatleri</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hizmetler">
          <Hizmetler kategoriler={kategoriler as KategoriDto[]} />
        </TabsContent>
        
        <TabsContent value="calisma-saatleri">
          <WorkingHours />
        </TabsContent>
      </Tabs>
    </div>
  );
}
