
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface WorkingHoursErrorStateProps {
  onRetry?: () => void;
}

export function WorkingHoursErrorState({ onRetry }: WorkingHoursErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-white border rounded-lg shadow-sm">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Çalışma Saatleri Yüklenemedi</h3>
      <p className="text-muted-foreground mb-4">
        Çalışma saatlerini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}
