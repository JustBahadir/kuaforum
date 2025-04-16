
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelInfoTab } from "./personnel-detail-tabs/PersonnelInfoTab";
import { PersonnelImageTab } from "./personnel-detail-tabs/PersonnelImageTab";
import { WorkInfoTab } from "./personnel-detail-tabs/WorkInfoTab";
import { personelServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { PerformanceTab } from "./personnel-detail-tabs/PerformanceTab";
import { Button } from "@/components/ui/button";

interface PersonnelDetailsDialogProps {
  personId?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void; // Add this prop
  onRefreshList?: () => void;
  personnel?: any; // Add this prop
}

export function PersonnelDetailsDialog({
  personId,
  isOpen,
  onClose,
  onOpenChange,
  onRefreshList,
  personnel: externalPersonnel, // Accept external personnel data
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const { data: personnel, isLoading: isPersonnelLoading, refetch: refetchPersonnel } = useQuery({
    queryKey: ["personnel-detail", personId],
    queryFn: () => personId ? personelServisi.getirById(personId) : null,
    enabled: !!personId && isOpen,
    initialData: externalPersonnel || null, // Use external data if provided
  });

  const { data: operations = [], isLoading: isOperationsLoading, refetch: refetchOperations } = useQuery({
    queryKey: ["personnel-operations", personId],
    queryFn: async () => {
      if (!personId) return [];
      
      const operations = await personelIslemleriServisi.hepsiniGetir();
      return operations.filter(op => op.personel_id === personId);
    },
    enabled: !!personId && isOpen,
  });

  useEffect(() => {
    if (personId) {
      setSelectedPersonId(personId);
      // Reset to default tab when dialog opens with a new personnel
      setActiveTab("info");
    }
  }, [personId]);

  const handleRefreshData = async () => {
    if (selectedPersonId) {
      await refetchPersonnel();
      await refetchOperations();
      if (onRefreshList) {
        onRefreshList();
      }
    }
  };

  // Handle the onOpenChange callback
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
    
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  if (isPersonnelLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>Personel Detayları</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl">
              {personnel?.ad_soyad || "Personel Detayları"}
            </DialogTitle>
            {personnel?.created_at && (
              <p className="text-sm text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(personnel.created_at), {
                  addSuffix: true,
                  locale: tr,
                })}{" "}
                eklendi
              </p>
            )}
          </div>
          <div className="flex items-center">
            <Button variant="outline" onClick={handleRefreshData}>
              Yenile
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="info">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="work">Çalışma Bilgileri</TabsTrigger>
            <TabsTrigger value="photo">Fotoğraf</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            {personnel && (
              <PersonnelInfoTab
                personnel={personnel}
                onSave={handleRefreshData}
              />
            )}
          </TabsContent>

          <TabsContent value="work" className="mt-4">
            {personnel && (
              <WorkInfoTab
                personnel={personnel}
                onSave={handleRefreshData}
              />
            )}
          </TabsContent>

          <TabsContent value="photo" className="mt-4">
            {personnel && (
              <PersonnelImageTab
                personnel={personnel}
                onSave={handleRefreshData}
              />
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <PerformanceTab 
              personnel={personnel} 
              operations={operations}
              isLoading={isOperationsLoading} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
