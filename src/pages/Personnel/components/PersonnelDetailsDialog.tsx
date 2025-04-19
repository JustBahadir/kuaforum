
import React, { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoTab } from "./personnel-detail-tabs/PersonalInfoTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
import { cn } from "@/lib/utils";

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

  // Close on mobile back button press (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onOpenChange(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onOpenChange]);

  if (!personnel) {
    return null;
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
        <DialogPrimitive.Content className={cn(
          "fixed left-[50%] top-[50%] z-50 max-w-4xl max-h-[90vh] w-full overflow-y-auto rounded-lg bg-background p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
        )}>
          {/* Close button top right */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
            <X className="h-5 w-5" aria-label="Kapat" />
          </DialogPrimitive.Close>

          <div className="text-xl font-semibold flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center select-none">
              {personnel.ad_soyad?.substring(0, 1) || "P"}
            </div>
            {personnel.ad_soyad || "Personel Detayları"}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
              <TabsTrigger value="operations-history">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="performance">Performans</TabsTrigger>
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
          </Tabs>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
