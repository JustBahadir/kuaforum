
import { Button } from "@/components/ui/button";

interface WorkingHoursActionsProps {
  editingMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export function WorkingHoursActions({ 
  editingMode, 
  onEdit, 
  onCancel, 
  onSave, 
  isSaving, 
  hasChanges 
}: WorkingHoursActionsProps) {
  if (!editingMode) {
    return (
      <Button variant="outline" onClick={onEdit}>
        Düzenle
      </Button>
    );
  }
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isSaving}
      >
        İptal
      </Button>
      <Button 
        onClick={onSave}
        disabled={isSaving || !hasChanges}
      >
        {isSaving ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </>
  );
}
