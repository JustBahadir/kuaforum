
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonalInfoTab } from "./personnel-detail-tabs/PersonalInfoTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";

interface PersonnelDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
  onPersonnelUpdated?: () => void;
}

export function PersonnelDetailDialog({
  isOpen,
  onOpenChange,
  personnel,
  onPersonnelUpdated
}: PersonnelDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("personal");

  if (!personnel) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatWorkingSystem = (system: string): string => {
    switch (system?.toLowerCase()) {
      case "aylik_maas":
        return "Aylık Maaşlı";
      case "haftalik_maas":
        return "Haftalık Maaşlı";
      case "gunluk_maas":
        return "Günlük Maaşlı";
      case "prim_komisyon":
        return "Yüzdelik";
      default:
        return system || "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 bg-background sticky top-0 z-10 border-b">
          <div className="flex gap-4 items-center">
            <Avatar className="h-12 w-12">
              {personnel.avatar_url && <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />}
              <AvatarFallback>{getInitials(personnel.ad_soyad)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{personnel.ad_soyad}</h2>
              <p className="text-sm text-muted-foreground">{formatWorkingSystem(personnel.calisma_sistemi)}</p>
            </div>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mt-4"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="work">Çalışma Bilgileri</TabsTrigger>
              <TabsTrigger value="performance">Performans</TabsTrigger>
              <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="p-6 pt-4">
          <TabsContent value="personal" className="mt-0">
            <PersonalInfoTab personnel={personnel} />
          </TabsContent>
        
          <TabsContent value="work" className="mt-0">
            <WorkInfoTab personnel={personnel} />
          </TabsContent>
        
          <TabsContent value="performance" className="mt-0">
            <PerformanceTab personnel={personnel} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <OperationsHistoryTab personnel={personnel} />
          </TabsContent>
        </div>
      </DialogContent>
    </Dialog>
  );
}
