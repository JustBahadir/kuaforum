
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    
    try {
      console.log("Attempting login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        setLoginError(`Giriş hatası: ${error.message}`);
        throw error;
      }
      
      // Verify if user has staff role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error("Error checking user role:", profileError);
        setLoginError("Kullanıcı bilgileri alınamadı");
        throw new Error("Kullanıcı bilgileri alınamadı");
      }
      
      if (profileData?.role !== 'staff') {
        // Sign out if not staff
        await supabase.auth.signOut();
        setLoginError("Bu giriş sadece kuaför personeli içindir. Müşteri girişi için ana sayfayı kullanın.");
        throw new Error("Bu giriş sadece kuaför personeli içindir. Müşteri girişi için ana sayfayı kullanın.");
      }
      
      // Check if profile exists in personel table
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('id')
        .eq('auth_id', data.user.id)
        .maybeSingle();
      
      if (personnelError) {
        console.error("Error checking personnel record:", personnelError);
      }
      
      // If personnel record doesn't exist, create one
      if (!personnelData) {
        // Get user details
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user details:", userError);
        } else {
          // Create personnel record
          const firstName = user.user_metadata?.first_name || '';
          const lastName = user.user_metadata?.last_name || '';
          const fullName = `${firstName} ${lastName}`;
          const phone = user.user_metadata?.phone || '';
          
          const { error: insertError } = await supabase
            .from('personel')
            .insert({
              auth_id: user.id,
              ad_soyad: fullName,
              telefon: phone,
              eposta: email,
              adres: '',
              personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
              maas: 0,
              calisma_sistemi: 'aylik',
              prim_yuzdesi: 0
            });
            
          if (insertError) {
            console.error("Error creating personnel record:", insertError);
          }
        }
      }
      
      toast.success("Kuaför girişi başarılı!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      
      if (error.message && error.message.includes("Invalid login credentials")) {
        setLoginError("Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol ediniz.");
        toast.error("Geçersiz e-posta veya şifre");
      } else {
        setLoginError(`Giriş yapılamadı: ${error.message}`);
        toast.error("Giriş yapılamadı: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setResetEmail(email);
    setShowForgotDialog(true);
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    
    setResetEmailSending(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
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

  // Development/Test login - bypasses authentication for testing
  const handleTestLogin = async () => {
    setLoading(true);
    setLoginError(null);
    
    try {
      const testEmail = "ergun@gmail.com";
      const testPassword = "password123";
      
      // First try normal login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (error) {
        console.log("Normal login failed, attempting to create test user:", error);
        
        // Try to create the user if it doesn't exist
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
          user_metadata: {
            first_name: "Ergun",
            last_name: "Test",
            role: "staff"
          }
        });
        
        if (signUpError) {
          console.error("Error creating test user:", signUpError);
          throw new Error(`Test kullanıcısı oluşturulamadı: ${signUpError.message}`);
        }
        
        // Set user as staff in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            first_name: "Ergun",
            last_name: "Test",
            role: "staff"
          });
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        // Create personnel record
        const { error: personnelError } = await supabase
          .from('personel')
          .upsert({
            auth_id: signUpData.user.id,
            ad_soyad: "Ergun Test",
            telefon: "555-1234",
            eposta: testEmail,
            adres: "Test Adres",
            personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
            maas: 5000,
            calisma_sistemi: "aylik",
            prim_yuzdesi: 10
          });
        
        if (personnelError) {
          console.error("Error creating personnel record:", personnelError);
        }
        
        // Try to sign in with the newly created user
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (loginError) {
          throw loginError;
        }
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
        
        {/* Test login button for development only */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestLogin}
            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
            disabled={loading}
          >
            Test Girişi (ergun@gmail.com)
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
