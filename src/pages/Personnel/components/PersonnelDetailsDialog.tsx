
import React, { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoTab } from "./personnel-detail-tabs/PersonalInfoTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
import { PersonnelImageTab } from "./personnel-detail-tabs/PersonnelImageTab";

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
  onUpdate = () => {}
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("personal-info");

  if (!personnel) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              {personnel.ad_soyad?.substring(0, 1) || "P"}
            </div>
            {personnel.ad_soyad || "Personel Detayları"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
            <TabsTrigger value="operations-history">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
            <TabsTrigger value="image">Fotoğraf</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="mt-4">
            <PersonalInfoTab personnel={personnel} onEdit={onUpdate} />
          </TabsContent>

          <TabsContent value="work-info" className="mt-4">
            <WorkInfoTab personnel={personnel} onEdit={onUpdate} />
          </TabsContent>

          <TabsContent value="operations-history" className="mt-4">
            <OperationsHistoryTab personnelId={personnel.id} />
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <PerformanceTab personnelId={personnel.id} />
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <PersonnelImageTab personnel={personnel} />
          </TabsContent>
        </Tabs>
      </AlertDialogContent>
    </AlertDialog>
  );
}
