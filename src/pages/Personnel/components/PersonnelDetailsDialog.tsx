
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
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
  const [personnelData, setPersonnelData] = useState(personnel || {});
  
  // Fetch the most up-to-date personnel data when dialog opens
  const { data: fetchedPersonnel, isLoading } = useQuery({
    queryKey: ["personel", personnel?.id],
    queryFn: () => personelServisi.getirById(personnel?.id),
    enabled: isOpen && !!personnel?.id,
  });

  // Update local state when query returns
  useEffect(() => {
    if (fetchedPersonnel) {
      setPersonnelData(fetchedPersonnel);
    }
  }, [fetchedPersonnel]);
  
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
    if (!fullName) return "??";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Use the updated personnel data if available, otherwise use the passed personnel
  const displayPersonnel = fetchedPersonnel || personnelData || {};
  
  console.log("Display personnel data:", displayPersonnel);
  
  // Make sure displayPersonnel has all the required properties
  const safeDisplayPersonnel = {
    ...displayPersonnel,
    ad_soyad: displayPersonnel.ad_soyad || '',
    avatar_url: displayPersonnel.avatar_url || null,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {safeDisplayPersonnel?.avatar_url ? (
                <AvatarImage src={safeDisplayPersonnel.avatar_url} alt={safeDisplayPersonnel.ad_soyad} />
              ) : (
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {getInitials(safeDisplayPersonnel?.ad_soyad)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <DialogTitle className="text-xl">
                {safeDisplayPersonnel?.ad_soyad || 'Personel'}
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
            <PersonalInfoTab personnel={safeDisplayPersonnel} />
          </TabsContent>
          
          <TabsContent value="work-info">
            <WorkInfoTab 
              personnel={safeDisplayPersonnel} 
              onEdit={onUpdate} 
              canEdit={true} 
            />
          </TabsContent>
          
          <TabsContent value="operations-history">
            <OperationsHistoryTab personnelId={safeDisplayPersonnel?.id} showPoints={showPoints} />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceTab personnelId={safeDisplayPersonnel?.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
