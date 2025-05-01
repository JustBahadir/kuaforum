
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EducationTab } from "./EducationTab";
import { HistoryTab } from "./HistoryTab";
import { toast } from "sonner";

export function UnassignedStaffMain() {
  const [activeTab, setActiveTab] = useState("education");
  const [isLoading, setIsLoading] = useState(false);
  const [educationData, setEducationData] = useState({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    universitedurumu: "",
    universitebolum: "",
    meslekibrans: ""
  });
  
  const [historyData, setHistoryData] = useState({
    isyerleri: "",
    gorevpozisyon: "",
    cv: "",
    belgeler: "",
    yarismalar: ""
  });
  
  const handleEducationSave = async () => {
    try {
      setIsLoading(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Eğitim bilgileri kaydedildi");
    } catch (error) {
      console.error("Error saving education data:", error);
      toast.error("Eğitim bilgileri kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHistorySave = async () => {
    try {
      setIsLoading(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Geçmiş bilgileri kaydedildi");
    } catch (error) {
      console.error("Error saving history data:", error);
      toast.error("Geçmiş bilgileri kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personel Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
            <TabsTrigger value="history">Geçmiş Bilgileri</TabsTrigger>
          </TabsList>
          
          <TabsContent value="education">
            <EducationTab 
              educationData={educationData}
              isLoading={isLoading}
              onSave={handleEducationSave}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <HistoryTab
              historyData={historyData}
              isLoading={isLoading}
              onSave={handleHistorySave}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
