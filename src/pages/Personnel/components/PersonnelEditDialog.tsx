
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";

import { PersonnelForm } from "./PersonnelForm";
import { PersonnelOperationsTable } from "./PersonnelOperationsTable";
import { PersonnelPerformance } from "./PersonnelPerformance";

interface PersonnelEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
}

export function PersonnelEditDialog({
  isOpen,
  onOpenChange,
  personnel
}: PersonnelEditDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    ad_soyad: personnel?.ad_soyad || "",
    telefon: personnel?.telefon || "",
    eposta: personnel?.eposta || "",
    adres: personnel?.adres || "",
    birth_date: personnel?.birth_date || "",
    iban: personnel?.iban || "",
    personel_no: personnel?.personel_no || "",
    calisma_sistemi: personnel?.calisma_sistemi || "maaşlı",
    maas: personnel?.maas || 0,
    prim_yuzdesi: personnel?.prim_yuzdesi || 0,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await personelServisi.guncelle(personnel.id, data);
    },
    onSuccess: () => {
      toast.success("Personel başarıyla güncellendi!");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Personel güncellenirken bir hata oluştu.");
    },
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personel Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="personal-info">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="work-info">Çalışma Bilgileri</TabsTrigger>
              <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="performance">Performans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal-info">
              <PersonnelForm 
                personnel={formData}
                onChange={handleFormChange}
                readOnly={false}
              />
            </TabsContent>
            
            <TabsContent value="work-info">
              <div className="space-y-6">
                <PersonnelForm 
                  personnel={formData}
                  onChange={handleFormChange}
                  readOnly={false}
                  showWorkInfo={true}
                  showPersonalInfo={false}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <PersonnelOperationsTable personnelId={personnel.id} />
            </TabsContent>
            
            <TabsContent value="performance">
              <PersonnelPerformance personnelId={personnel.id} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
