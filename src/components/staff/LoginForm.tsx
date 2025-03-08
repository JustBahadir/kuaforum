import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { authenticationService } from "@/lib/auth/services/authenticationService";
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
  
  // Kullanıcı temizleme (geliştirici modu)
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState("");
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupSuccess, setCleanupSuccess] = useState(false);

  // Login function
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
        // Check user role
        const metadata = data.user.user_metadata;
        if (metadata?.role === 'staff' || metadata?.role === 'admin') {
          toast.success("Giriş başarılı!");
          onSuccess();
        } else {
          // Logout if not staff or admin
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

  // Reset password function
  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    
    setResetLoading(true);
    
    try {
      await authenticationService.resetPassword(resetEmail);
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");
      setShowForgotDialog(false);
    } catch (error: any) {
      toast.error("Şifre sıfırlama işlemi başarısız: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };
  
  // Delete user function (development only)
  const handleDeleteUser = async () => {
    if (!emailToDelete) {
      toast.error("Lütfen silmek istediğiniz e-posta adresini girin");
      return;
    }
    
    setCleanupLoading(true);
    setCleanupSuccess(false);
    
    try {
      const result = await authenticationService.deleteUserByEmail(emailToDelete);
      if (result.success) {
        toast.success(result.message);
        setCleanupSuccess(true);
        // Form temizliği
        setEmailToDelete("");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("Kullanıcı silme işlemi başarısız: " + error.message);
    } finally {
      setCleanupLoading(false);
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
        
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="destructive"
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={() => setShowCleanupDialog(true)}
          >
            <Trash2 size={14} />
            Hesap Temizle (DEV)
          </Button>
          
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
          className="w-full"
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
      
      {/* User Cleanup Dialog (Development Only) */}
      <Dialog open={showCleanupDialog} onOpenChange={(open) => {
        setShowCleanupDialog(open);
        if (!open) setCleanupSuccess(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="text-red-500" size={18} />
              Kullanıcı Temizle (Geliştirici Modu)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {cleanupSuccess ? (
              <Alert>
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600">
                  Kullanıcı başarıyla silindi. Artık yeni kayıt yapabilirsiniz.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="font-medium">
                  Bu işlem, belirtilen e-posta adresine sahip kullanıcıyı tamamen silecektir. Bu işlem geri alınamaz!
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="delete-email">Silmek İstediğiniz E-posta</Label>
              <Input
                id="delete-email"
                type="email"
                value={emailToDelete}
                onChange={(e) => setEmailToDelete(e.target.value)}
                placeholder="silinecek@email.com"
              />
              <p className="text-xs text-gray-500">
                Örnek: ergun@gmail.com, nimet@gmail.com
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCleanupDialog(false);
                setCleanupSuccess(false);
              }}
              disabled={cleanupLoading}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={cleanupLoading || cleanupSuccess}
            >
              {cleanupLoading ? "Siliniyor..." : "Kullanıcıyı Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
