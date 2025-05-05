
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Bu bileşenler geçici olarak devre dışı bırakılmış sayfalar için kullanılır

interface DisabledComponentProps {
  title?: string;
  description?: string;
}

export function DevreDisiBilesenSayfa({ title = "Bu Sayfa Henüz Hazır Değil", description = "Bu sayfa şu anda geliştirme aşamasındadır ve yakında kullanıma açılacaktır." }: DisabledComponentProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
        
        <Button onClick={() => navigate("/")} className="w-full">
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
}

export function IsletmeSahibiSayfasi({ durum = "" } = {}) {
  return (
    <DevreDisiBilesenSayfa 
      title="İşletme Sahibi Sayfası"
      description={`Bu sayfa işletme sahipleri için tasarlanmıştır. Şu anda geliştirme aşamasındadır. ${durum ? `Durum: ${durum}` : ""}`}
    />
  );
}

export function PersonelSayfasi({ durum = "" } = {}) {
  return (
    <DevreDisiBilesenSayfa 
      title="Personel Sayfası"
      description={`Bu sayfa personel için tasarlanmıştır. Şu anda geliştirme aşamasındadır. ${durum ? `Durum: ${durum}` : ""}`}
    />
  );
}
