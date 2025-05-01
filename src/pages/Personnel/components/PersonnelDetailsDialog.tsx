
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoTab } from "./personnel-detail-tabs/PersonalInfoTab";
import { EducationTab } from "./personnel-detail-tabs/EducationTab";
import { HistoryTab } from "./personnel-detail-tabs/HistoryTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab"; 

interface PersonnelDetailsDialogProps {
  personel: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function PersonnelDetailsDialog({
  personel,
  open,
  onOpenChange,
  onRefresh,
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = React.useState("personal");

  const handleCancelChanges = () => {
    setActiveTab("personal");
    onOpenChange(false);
  };

  // Reset active tab when dialog opens
  React.useEffect(() => {
    if (open) {
      setActiveTab("personal");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {personel?.ad_soyad} - {personel?.personel_no}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>

          <TabsContent
            value="personal"
            className="flex-1 overflow-y-auto pt-2"
          >
            <PersonalInfoTab
              personel={personel}
              onEdit={() => setActiveTab("education")}
            />
          </TabsContent>

          <TabsContent
            value="operations"
            className="flex-1 overflow-y-auto pt-2"
          >
            <OperationsHistoryTab personelId={personel?.id} />
          </TabsContent>

          <TabsContent
            value="education"
            className="flex-1 overflow-y-auto pt-2"
          >
            <EducationTab
              personel={personel}
              onRefresh={onRefresh}
              onClose={handleCancelChanges}
            />
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto pt-2">
            <HistoryTab
              personel={personel}
              onRefresh={onRefresh}
              onClose={handleCancelChanges}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
