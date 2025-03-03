
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
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
  const navigate = useNavigate();

  // Simplified login function - focus on reliability and error handling
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

  // Test login function - completely rewritten to be simpler and more reliable
  const handleTestLogin = async () => {
    setLoading(true);
    setLoginError(null);
    
    const TEST_EMAIL = "test@example.com";
    const TEST_PASSWORD = "123456789";
    
    try {
      // First, try to sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      // If login failed, try to create the test user
      if (error) {
        console.log("Test login failed, creating test user:", error.message);
        
        // Sign up with test email and password
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          options: {
            data: {
              first_name: "Test",
              last_name: "User",
              role: "admin"
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            // If user is registered but password doesn't match, show error
            setLoginError("Test hesabı mevcut ama şifre uyuşmuyor. Lütfen test kullanıcısı şifresi olarak '123456789' kullanın.");
            toast.error("Test hesabı mevcut ama şifre uyuşmuyor. Şifre: 123456789");
            setLoading(false);
            return;
          } else {
            throw new Error(`Test kullanıcısı oluşturulamadı: ${signUpError.message}`);
          }
        }
        
        if (!signUpData.user) {
          throw new Error("Test kullanıcısı oluşturuldu ancak kullanıcı verisi alınamadı");
        }
        
        // Set user as admin in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            first_name: "Test",
            last_name: "User",
            role: "admin" 
          });
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        // Create a test shop for the user
        const { data: shopData, error: shopError } = await supabase
          .from('dukkanlar')
          .insert({
            ad: "Test Kuaför",
            sahibi_id: signUpData.user.id,
            kod: "test-kuafor-123"
          })
          .select()
          .single();
            
        if (shopError) {
          console.error("Error creating test shop:", shopError);
        }
        
        // Try to sign in again with the newly created user
        ({ data, error } = await supabase.auth.signInWithPassword({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        }));
        
        if (error) {
          throw new Error(`Test kullanıcı girişi başarısız: ${error.message}`);
        }
      }
      
      if (!data || !data.user) {
        throw new Error("Giriş başarılı ama kullanıcı verisi alınamadı");
      }
      
      toast.success("Test kullanıcısı ile giriş başarılı!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Test login error:", error);
      setLoginError(`Test girişi başarısız: ${error.message}`);
      toast.error("Test girişi başarısız: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Direct login without password for development
  const handleDevLogin = async () => {
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    
    setLoading(true);
    setLoginError(null);
    
    try {
      // Generate a magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Bu e-posta hesabı onaylanmamış. Lütfen e-postanızı kontrol edin.");
          setLoginError("Bu e-posta hesabı onaylanmamış. Lütfen e-postanızı kontrol edin.");
        } else if (error.message.includes("User not found")) {
          toast.error("Bu e-posta ile kayıtlı kullanıcı bulunamadı.");
          setLoginError("Bu e-posta ile kayıtlı kullanıcı bulunamadı. Lütfen kayıt olun.");
        } else {
          toast.error(`Giriş hatası: ${error.message}`);
          setLoginError(`Giriş hatası: ${error.message}`);
        }
        setLoading(false);
        return;
      }
      
      toast.success("Giriş bağlantısı e-postanıza gönderildi. Lütfen e-postanızı kontrol edin.");
      setLoginError(null);
    } catch (error: any) {
      console.error("Dev login error:", error);
      setLoginError(`Giriş hatası: ${error.message}`);
      toast.error("Giriş hatası: " + error.message);
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

        <div className="text-center mt-2">
          <Button 
            type="button" 
            variant="link" 
            onClick={handleDevLogin}
            className="text-xs text-purple-600"
            disabled={loading || !email}
          >
            Şifresiz Giriş (Geliştirici Modu)
          </Button>
        </div>
        
        {/* Test login button for development only */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestLogin}
            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
            disabled={loading}
          >
            Test Girişi (Şifre: 123456789)
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Bu buton sadece test amaçlıdır. Canlı ortamda kaldırılacaktır.
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
