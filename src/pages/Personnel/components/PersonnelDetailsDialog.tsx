
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelInfoTab } from "./personnel-detail-tabs/PersonnelInfoTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { PersonnelImageTab } from "./personnel-detail-tabs/PersonnelImageTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";

interface PersonnelDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
  onUpdate?: () => void;
}

export function PersonnelDetailsDialog({
  isOpen,
  onOpenChange,
  personnel,
  onUpdate
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("info");

  // Fetch personnel operations
  const {
    data: operations = [],
    isLoading
  } = useQuery({
    queryKey: ["personnelOperations", personnel?.id],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnel.id),
    enabled: !!personnel?.id && isOpen,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Ensure the dialog doesn't appear if no personnel is selected
  if (!personnel) return null;

  // Use a larger size for the dialog on desktop
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={() => onOpenChange(false)}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with date pickers or dropdowns
          if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-4">
            {personnel?.ad_soyad || "Personel Detayları"}
          </h2>
          
          <Tabs defaultValue="info" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="info">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="work">Çalışma Bilgileri</TabsTrigger>
              <TabsTrigger value="photo">Fotoğraf</TabsTrigger>
              <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="performance">Performans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <PersonnelInfoTab 
                personnel={personnel} 
                onUpdate={onUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="work">
              <WorkInfoTab 
                personnel={personnel} 
                onUpdate={onUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="photo">
              <PersonnelImageTab 
                personnel={personnel} 
                onUpdate={onUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="operations">
              <OperationsHistoryTab 
                personnel={personnel}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="performance">
              <PerformanceTab 
                personnel={personnel} 
                operations={operations}
                isLoading={isLoading} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
