
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CustomerFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  disabled?: boolean;
}

export function CustomerFormActions({
  isSubmitting,
  onCancel,
  disabled = false
}: CustomerFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        İptal
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Ekleniyor...
          </>
        ) : 'Müşteri Ekle'}
      </Button>
    </div>
  );
}
