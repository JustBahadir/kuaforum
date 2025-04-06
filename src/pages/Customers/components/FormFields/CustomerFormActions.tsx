
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface CustomerFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export function CustomerFormActions({ isSubmitting, onCancel, submitLabel = "Kaydet" }: CustomerFormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        İptal
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" /> 
            Kaydediliyor...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
