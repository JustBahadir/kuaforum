
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { PersonnelHistoryTable } from "./PersonnelHistoryTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface PersonnelPerformanceReportsProps {
  personnelId: number;
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [activeTab, setActiveTab] = useState("islemGecmisi");

  const { data: personnelDetails, isLoading: isPersonnelLoading } = useQuery({
    queryKey: ['personel', personnelId],
    queryFn: async () => {
      if (!personnelId) return null;
      return personelServisi.getirById(personnelId);
    },
    enabled: !!personnelId,
  });

  if (isPersonnelLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!personnelDetails) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Personel bilgisi bulunamadı.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{personnelDetails.ad_soyad}</h2>
          <p className="text-gray-500">{personnelDetails.unvan || "Personel"}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="islemGecmisi">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="performans">Performans Detayları</TabsTrigger>
        </TabsList>

        <TabsContent value="islemGecmisi" className="mt-6">
          <PersonnelHistoryTable personnelId={personnelId} />
        </TabsContent>

        <TabsContent value="performans">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">Personel performans detayları yakında eklenecek.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
