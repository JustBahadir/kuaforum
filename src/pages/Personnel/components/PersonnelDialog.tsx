
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PersonnelForm } from "@/components/operations/PersonnelForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { toast } from "sonner";

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonnelAdded?: () => void;
}

export function PersonnelDialog({ 
  open, 
  onOpenChange,
  onPersonnelAdded 
}: PersonnelDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    calisma_sistemi: "aylik_maas",
    maas: 0,
    prim_yuzdesi: 0,
    iban: "",
    birth_date: ""
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await personelServisi.ekle(data);
    },
    onSuccess: () => {
      toast.success("Personel başarıyla eklendi!");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      onPersonChange();
      if (onPersonnelAdded) {
        onPersonnelAdded();
      }
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Personel eklenirken bir hata oluştu.");
    },
  });

  // Reset form on open state change
  useEffect(() => {
    if (open) {
      setFormData({
        ad_soyad: "",
        telefon: "",
        eposta: "",
        adres: "",
        personel_no: "",
        calisma_sistemi: "aylik_maas",
        maas: 0,
        prim_yuzdesi: 0,
        iban: "",
        birth_date: ""
      });
    }
  }, [open]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If changing to commission-based, set salary to 0
    if (field === "calisma_sistemi" && value === "prim_komisyon") {
      setFormData(prev => ({
        ...prev,
        calisma_sistemi: value,
        maas: 0
      }));
    }
    
    // If changing to salary-based, set commission to 0
    if (field === "calisma_sistemi" && value !== "prim_komisyon") {
      setFormData(prev => ({
        ...prev,
        calisma_sistemi: value,
        prim_yuzdesi: 0
      }));
    }
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.ad_soyad.trim()) {
      toast.error("Ad Soyad alanı boş olamaz.");
      return;
    }

    // Create personnel
    createMutation.mutate(formData);
  };

  const onPersonChange = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yeni Personel Ekle</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <PersonnelForm 
            personnel={formData}
            onChange={handleFormChange}
          />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Ekleniyor..." : "Personel Ekle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
