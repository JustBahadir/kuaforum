
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonnelForm } from "./PersonnelForm";
import { usePersonnelMutation } from "../hooks/usePersonnelMutation";
import { Personel, PersonnelDialogProps } from "@/types/personnel";

export function PersonnelDialog({
  isOpen,
  onClose,
  onSuccess,
  personnel,
  isEditMode,
}: PersonnelDialogProps) {
  const { createPersonnel, updatePersonnel, loading } = usePersonnelMutation();
  
  const handleSubmit = async (formData: Omit<Personel, "id" | "created_at">) => {
    let success = false;
    
    if (isEditMode && personnel) {
      const result = await updatePersonnel(personnel.id.toString(), formData);
      success = !!result;
    } else {
      const result = await createPersonnel(formData);
      success = !!result;
    }
    
    if (success) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Personel Düzenle" : "Yeni Personel Ekle"}
          </DialogTitle>
        </DialogHeader>
        
        <PersonnelForm
          personel={personnel as Personel}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
