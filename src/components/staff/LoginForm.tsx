
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Basitleştirilmiş giriş fonksiyonu
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      setLoginError("Lütfen e-posta ve şifre girin");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Giriş yapılıyor:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Giriş hatası:", error);
        setLoginError(error.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
        setLoading(false);
        return;
      }
      
      if (data?.user) {
        // Kullanıcı rolünü kontrol et
        const metadata = data.user.user_metadata;
        if (metadata?.role === 'staff' || metadata?.role === 'admin') {
          toast.success("Giriş başarılı!");
          onSuccess();
        } else {
          // Personel veya admin değilse çıkış yap
          await supabase.auth.signOut();
          setLoginError("Bu giriş sayfası sadece personel ve yöneticiler içindir.");
        }
      } else {
        setLoginError("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setLoginError(error.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama fonksiyonu 
  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/staff-login`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");
      setShowForgotDialog(false);
    } catch (error: any) {
      toast.error("Şifre sıfırlama işlemi başarısız: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        {loginError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

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
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="link" 
            className="text-xs text-purple-600"
            onClick={() => setShowForgotDialog(true)}
          >
            Şifremi Unuttum
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Şifremi Unuttum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Şifrenizi sıfırlamak için e-posta adresinizi girin. Size bir sıfırlama bağlantısı göndereceğiz.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-posta</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="ornek@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForgotDialog(false)}
              disabled={resetLoading}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
