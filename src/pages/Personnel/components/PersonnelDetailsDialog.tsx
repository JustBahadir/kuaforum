
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

// Import tabs
import { PersonalInfoTab } from "./personnel-detail-tabs/PersonalInfoTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
interface PersonnelDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
  onUpdate: () => void;
  onClose?: () => void;
  showPoints?: boolean;
}
export function PersonnelDetailsDialog({
  isOpen,
  onOpenChange,
  personnel,
  onUpdate,
  onClose,
  showPoints = false
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("personal-info");
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };
  if (!personnel) {
    return null;
  }
  const getInitials = (fullName: string) => {
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Determine if the Edit button should be shown based on active tab
  const showEditButton = activeTab === "work-info";
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {getInitials(personnel.ad_soyad)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">
                {personnel.ad_soyad}
              </DialogTitle>
              <DialogDescription>
                Personel Bilgileri
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
            <TabsTrigger value="operations-history">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal-info">
            <PersonalInfoTab personnel={personnel} />
          </TabsContent>
          
          <TabsContent value="work-info">
            <WorkInfoTab personnel={personnel} onEdit={onUpdate} canEdit={true} />
          </TabsContent>
          
          <TabsContent value="operations-history">
            <OperationsHistoryTab personnelId={personnel.id} showPoints={showPoints} />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceTab personnelId={personnel.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
}
