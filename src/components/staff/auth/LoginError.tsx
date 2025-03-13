
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginErrorProps {
  error: string | null;
}

export function LoginError({ error }: LoginErrorProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4 border-red-500">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-semibold">Giriş Hatası</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
