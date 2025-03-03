
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
  const [showAuthResponse, setShowAuthResponse] = useState(false);
  const [authResponseData, setAuthResponseData] = useState<any>(null);
  const [showPasswordlessDialog, setShowPasswordlessDialog] = useState(false);
  const [passwordlessEmail, setPasswordlessEmail] = useState("");
  const [passwordlessCode, setPasswordlessCode] = useState("");
  const [passwordlessStep, setPasswordlessStep] = useState<"email" | "code">("email");
  const [passwordlessSending, setPasswordlessSending] = useState(false);

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
      
      // Save response for debugging
      setAuthResponseData({ data, error });
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol ediniz. Eğer şifrenizi hatırlamıyorsanız 'Şifremi Unuttum' butonunu kullanabilirsiniz veya 'Şifresiz Giriş' yapabilirsiniz.");
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
      setAuthResponseData({ error });
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

  // Passwordless login - send code
  const handleSendPasswordlessCode = async () => {
    if (!passwordlessEmail) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }

    setPasswordlessSending(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: passwordlessEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/staff-login`
        }
      });
      
      if (error) throw error;
      
      toast.success("Giriş kodu e-posta adresinize gönderildi");
      setPasswordlessStep("code");
    } catch (error: any) {
      console.error("Passwordless login error:", error);
      toast.error("Giriş kodu gönderilemedi: " + error.message);
    } finally {
      setPasswordlessSending(false);
    }
  };

  // Passwordless login - verify code
  const handleVerifyPasswordlessCode = async () => {
    if (!passwordlessCode) {
      toast.error("Lütfen giriş kodunu girin");
      return;
    }

    setPasswordlessSending(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: passwordlessEmail,
        token: passwordlessCode,
        type: 'email'
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Giriş başarılı!");
        setShowPasswordlessDialog(false);
        onSuccess();
      } else {
        throw new Error("Kullanıcı verisi alınamadı");
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast.error("Giriş kodu doğrulanamadı: " + error.message);
      setAuthResponseData({ error });
    } finally {
      setPasswordlessSending(false);
    }
  };

  const resetPasswordlessForm = () => {
    setPasswordlessStep("email");
    setPasswordlessEmail("");
    setPasswordlessCode("");
  };

  const openPasswordlessLogin = () => {
    resetPasswordlessForm();
    setShowPasswordlessDialog(true);
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
            <div className="mt-2 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowAuthResponse(true)}
              >
                Detayları Göster
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="link" 
            className="text-xs text-purple-600"
            onClick={openPasswordlessLogin}
          >
            Şifresiz Giriş
          </Button>
          
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
      </form>

      {/* Forgot Password Dialog */}
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
      
      {/* Passwordless Login Dialog */}
      <AlertDialog open={showPasswordlessDialog} onOpenChange={setShowPasswordlessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Şifresiz Giriş</AlertDialogTitle>
            <AlertDialogDescription>
              {passwordlessStep === "email" ? (
                <>
                  <p className="mb-4">
                    Şifresiz giriş yapmak için e-posta adresinizi girin.
                    Size bir giriş kodu göndereceğiz.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="passwordless-email">E-posta</Label>
                    <Input 
                      id="passwordless-email" 
                      type="email" 
                      value={passwordlessEmail}
                      onChange={(e) => setPasswordlessEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    <span className="font-medium">{passwordlessEmail}</span> adresine bir giriş kodu gönderdik.
                    Lütfen e-postanızı kontrol edin ve aşağıya gelen kodu girin.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="passwordless-code">Giriş Kodu</Label>
                    <Input 
                      id="passwordless-code" 
                      type="text" 
                      value={passwordlessCode}
                      onChange={(e) => setPasswordlessCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-xs mt-2 px-0"
                    onClick={resetPasswordlessForm}
                  >
                    E-posta adresini değiştir
                  </Button>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={passwordlessStep === "email" ? handleSendPasswordlessCode : handleVerifyPasswordlessCode}
              disabled={passwordlessSending}
            >
              {passwordlessSending 
                ? (passwordlessStep === "email" ? "Gönderiliyor..." : "Doğrulanıyor...") 
                : (passwordlessStep === "email" ? "Kod Gönder" : "Giriş Yap")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Auth Response Details Dialog */}
      <AlertDialog open={showAuthResponse} onOpenChange={setShowAuthResponse}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auth Yanıt Detayları</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-64">
                {JSON.stringify(authResponseData, null, 2)}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Kapat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
