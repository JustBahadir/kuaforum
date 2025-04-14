
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CustomerFormActionsProps {
  isSubmitting?: boolean;
  loading?: boolean; // For backward compatibility
  onCancel: () => void;
  onSubmit?: () => void; // For backward compatibility
  onSave?: () => Promise<void> | void; // New prop for EditCustomerForm
  actionText?: string;
  disabled?: boolean;
}

export function CustomerFormActions({
  isSubmitting = false,
  loading = false,
  onCancel,
  onSubmit,
  onSave,
  actionText = "Müşteri Ekle",
  disabled = false
}: CustomerFormActionsProps) {
  // Use either isSubmitting or loading
  const isLoading = isSubmitting || loading;
  
  const handleSubmit = () => {
    if (onSubmit) onSubmit();
    if (onSave) onSave();
  };
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isLoading}
      >
        İptal
      </Button>
      <Button 
        type={onSubmit || onSave ? "button" : "submit"}
        onClick={handleSubmit}
        disabled={isLoading || disabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {actionText === "Müşteri Ekle" ? "Ekleniyor..." : "Kaydediliyor..."}
          </>
        ) : actionText}
      </Button>
    </div>
  );
}
