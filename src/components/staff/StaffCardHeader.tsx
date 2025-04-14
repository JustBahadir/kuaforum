
import { ArrowLeft } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StaffCardHeaderProps {
  onBack?: () => void;
}

export function StaffCardHeader({ onBack }: StaffCardHeaderProps) {
  return (
    <CardHeader className="relative">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute left-4 top-4 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <CardTitle className="text-center text-xl">Personel Girişi</CardTitle>
      <CardDescription className="text-center">
        Personel hesabınız ile giriş yapın veya hesap oluşturun
      </CardDescription>
    </CardHeader>
  );
}
