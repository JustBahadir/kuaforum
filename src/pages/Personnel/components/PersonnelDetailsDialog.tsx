
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelInfoTab } from "./personnel-detail-tabs/PersonnelInfoTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab"; 
import { PersonnelImageTab } from "./personnel-detail-tabs/PersonnelImageTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";

interface PersonnelDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
  onUpdate: () => void;
  onClose?: () => void;
}

export function PersonnelDetailsDialog({
  isOpen,
  onOpenChange,
  personnel,
  onUpdate,
  onClose,
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("info");

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };
  
  if (!personnel) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {personnel.ad_soyad} - Personel Bilgileri
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="info">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="work">İş Bilgileri</TabsTrigger>
            <TabsTrigger value="photo">Fotoğraf</TabsTrigger>
            <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <PersonnelInfoTab personnel={personnel} onSave={onUpdate} />
          </TabsContent>
          
          <TabsContent value="work">
            <WorkInfoTab personnel={personnel} onSave={onUpdate} />
          </TabsContent>
          
          <TabsContent value="photo">
            <PersonnelImageTab personnel={personnel} onSave={onUpdate} />
          </TabsContent>
          
          <TabsContent value="history">
            <OperationsHistoryTab personnel={personnel} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
