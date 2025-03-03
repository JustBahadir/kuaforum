
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
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

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSending, setResetEmailSending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Standard login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen e-posta ve şifre girin");
      return;
    }

    setLoading(true);
    setLoginError(null);
    
    try {
      console.log("Attempting login with:", email);
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol ediniz.");
          toast.error("Geçersiz e-posta veya şifre");
        } else {
          setLoginError(`Giriş yapılamadı: ${error.message}`);
          toast.error("Giriş yapılamadı: " + error.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        throw new Error("Kullanıcı verisi alınamadı");
      }
      
      toast.success("Giriş başarılı!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setLoginError(`Giriş yapılamadı: ${error.message}`);
      toast.error("Giriş yapılamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    setResetEmail(email);
    setShowForgotDialog(true);
  };

  // Send password reset email
  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    
    setResetEmailSending(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/staff-login`,
      });
      
      if (error) throw error;
      
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");
      setShowForgotDialog(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Şifre sıfırlama e-postası gönderilemedi: " + error.message);
    } finally {
      setResetEmailSending(false);
    }
  };

  // Function to delete an existing account (for testing purposes)
  const handleDeleteAccount = async () => {
    if (!email) {
      toast.error("Lütfen silmek istediğiniz hesabın e-posta adresini girin");
      return;
    }
    
    setLoading(true);
    
    try {
      // This operation requires admin rights and would typically be done
      // through a server-side function in a production environment
      toast.info("Bu işlem normal şartlarda yönetici panelinden yapılmalıdır.");
      toast.error("Bu işlem API erişimi nedeniyle doğrudan uygulamadan yapılamaz.");
      toast.info("Supabase panelinden kullanıcıyı silip yeniden kayıt olabilirsiniz.");
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast.error("Hesap silme hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-email">E-posta</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="staff-email" 
              type="email" 
              placeholder="personel@salonyonetim.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="staff-password">Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="staff-password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        {loginError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {loginError}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="link" 
            className="text-xs text-purple-600"
            onClick={handleForgotPassword}
          >
            Şifremi Unuttum
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
        
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDeleteAccount}
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            disabled={loading || !email}
          >
            Bu Hesabı Sil
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Bu buton hesabınızı silmenize yardımcı olur.
            Dikkat: Bu işlem geri alınamaz!
          </p>
        </div>
      </form>

      <AlertDialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
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
              onClick={handleSendResetEmail}
              disabled={resetEmailSending}
            >
              {resetEmailSending ? "Gönderiliyor..." : "Gönder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
