
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PersonnelList } from "./components/PersonnelList";
import { PersonnelHistoryTable } from "./components/PersonnelHistoryTable";
import { PersonnelPerformance } from "./components/PersonnelPerformance";

export default function Personnel() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  
  // Default personelId for the PersonnelPerformance component
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="personel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personel">Personel Yönetimi</TabsTrigger>
          <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="raporlar">Performans Raporları</TabsTrigger>
        </TabsList>

        <TabsContent value="personel">
          <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
            </div>
            <PersonnelList onPersonnelSelect={setSelectedPersonnelId} />
          </div>
        </TabsContent>

        <TabsContent value="islemler">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
              <div className="flex gap-4">
                <DateRangePicker 
                  from={dateRange.from}
                  to={dateRange.to}
                  onSelect={range => setDateRange(range)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <PersonnelHistoryTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raporlar">
          {selectedPersonnelId ? (
            <PersonnelPerformance personnelId={selectedPersonnelId} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Lütfen performans raporlarını görüntülemek için personel listesinden bir personel seçin.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
