
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorkingHoursErrorStateProps {
  onRetry: () => void;
}

export function WorkingHoursErrorState({ onRetry }: WorkingHoursErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          Çalışma saatleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
        <Button onClick={onRetry} className="mt-4">Yeniden Dene</Button>
      </CardContent>
    </Card>
  );
}
