
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogCancel  
} from "@/components/ui/alert-dialog";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail: string;
  onSendReset: (email: string) => Promise<boolean>;
}

export function ForgotPasswordDialog({ 
  open, 
  onOpenChange, 
  defaultEmail, 
  onSendReset 
}: ForgotPasswordDialogProps) {
  const [resetEmail, setResetEmail] = useState(defaultEmail);
  const [resetEmailSending, setResetEmailSending] = useState(false);

  const handleSendEmail = async () => {
    setResetEmailSending(true);
    const success = await onSendReset(resetEmail);
    setResetEmailSending(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Şifre Sıfırlama</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-4">
              Şifrenizi sıfırlamak için e-posta adresinizi girin. 
              Şifre sıfırlama bağlantısı gönderilecektir.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-posta</Label>
              <Input 
                id="reset-email" 
                type="email" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSendEmail}
            disabled={resetEmailSending}
          >
            {resetEmailSending ? "Gönderiliyor..." : "Gönder"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
