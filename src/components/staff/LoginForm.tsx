
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

  // Regular login function
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
        throw error;
      }

      if (!data.user) {
        throw new Error("Kullanıcı verisi alınamadı");
      }
      
      // Check if user has staff role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking user role:", profileError);
        throw new Error("Kullanıcı bilgileri alınamadı");
      }
      
      // If user is not staff or admin, sign out
      if (profileData?.role !== 'staff' && profileData?.role !== 'admin') {
        await supabase.auth.signOut();
        setLoginError("Bu giriş sadece kuaför personeli içindir. Müşteri girişi için ana sayfayı kullanın.");
        throw new Error("Bu giriş sadece kuaför personeli içindir. Müşteri girişi için ana sayfayı kullanın.");
      }
      
      // Verify if user has an associated shop
      const shop = await dukkanServisi.personelAuthIdDukkani(data.user.id);
      
      if (!shop) {
        console.error("No shop associated with user");
        // If admin, they should have a shop
        if (profileData?.role === 'admin') {
          const ownerShop = await dukkanServisi.kullanicininDukkani(data.user.id);
          if (!ownerShop) {
            await supabase.auth.signOut();
            setLoginError("Hesabınıza bağlı bir dükkan bulunamadı. Lütfen yönetici ile iletişime geçin.");
            throw new Error("Hesabınıza bağlı bir dükkan bulunamadı");
          }
        } else {
          // Staff should have a shop assigned
          await supabase.auth.signOut();
          setLoginError("Hesabınıza bağlı bir dükkan bulunamadı. Lütfen yönetici ile iletişime geçin.");
          throw new Error("Hesabınıza bağlı bir dükkan bulunamadı");
        }
      }
      
      // Check if personnel record exists
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
        // Create a new personnel record
        const firstName = data.user.user_metadata?.first_name || '';
        const lastName = data.user.user_metadata?.last_name || '';
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : data.user.email?.split('@')[0] || 'Yeni Personel';
        const phone = data.user.user_metadata?.phone || '';
        const userEmail = data.user.email || '';
        
        // Get shop ID
        const userShop = await dukkanServisi.kullanicininDukkani(data.user.id);
        const shopId = userShop?.id;
        
        if (shopId) {
          const { error: insertError } = await supabase
            .from('personel')
            .insert({
              auth_id: data.user.id,
              ad_soyad: fullName,
              telefon: phone,
              eposta: userEmail,
              adres: '',
              personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
              maas: 0,
              calisma_sistemi: 'aylik',
              prim_yuzdesi: 0,
              dukkan_id: shopId
            });
            
          if (insertError) {
            console.error("Error creating personnel record:", insertError);
            // Continue anyway, we'll let the user in
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

  // Test login function - completely rewritten to be simpler and more reliable
  const handleTestLogin = async () => {
    setLoading(true);
    setLoginError(null);
    
    const TEST_EMAIL = "test@example.com";
    const TEST_PASSWORD = "password123";
    
    try {
      // First, try to sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      // If login failed, try to create the test user
      if (error) {
        console.log("Test login failed, creating test user:", error.message);
        
        if (error.message.includes("Invalid login credentials")) {
          // Sign up with test email and password
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            options: {
              data: {
                first_name: "Test",
                last_name: "User",
                role: "staff"
              }
            }
          });
          
          if (signUpError) {
            if (signUpError.message.includes("already registered")) {
              toast.error("Test hesabı mevcut ama şifre yanlış. Farklı bir test hesabı deneyin.");
              throw new Error("Test hesabı mevcut ama şifre uyuşmuyor.");
            } else {
              throw new Error(`Test kullanıcısı oluşturulamadı: ${signUpError.message}`);
            }
          }
          
          if (!signUpData.user) {
            throw new Error("Test kullanıcısı oluşturuldu ancak kullanıcı verisi alınamadı");
          }
          
          // Set user as staff in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: signUpData.user.id,
              first_name: "Test",
              last_name: "User",
              role: "staff" 
            });
          
          if (profileError) {
            console.error("Error updating profile:", profileError);
            // Continue anyway
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
            // Continue anyway
          }
          
          // Try to sign in again with the newly created user
          ({ data, error } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
          }));
          
          if (error) {
            throw new Error(`Test kullanıcı girişi başarısız: ${error.message}`);
          }
          
          if (shopData) {
            // Create personnel record
            const { error: personnelError } = await supabase
              .from('personel')
              .insert({
                auth_id: signUpData.user.id,
                ad_soyad: "Test User",
                telefon: "555-1234",
                eposta: TEST_EMAIL,
                adres: "Test Adres",
                personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
                maas: 5000,
                calisma_sistemi: "aylik",
                prim_yuzdesi: 10,
                dukkan_id: shopData.id
              });
              
            if (personnelError) {
              console.error("Error creating personnel record:", personnelError);
              // Continue anyway
            }
          }
        } else {
          throw error;
        }
      }
      
      if (!data || !data.user) {
        throw new Error("Giriş başarılı ama kullanıcı verisi alınamadı");
      }
      
      // Ensure user has shop association
      const shop = await dukkanServisi.personelAuthIdDukkani(data.user.id);
      if (!shop) {
        // Try to get shop as owner
        const ownerShop = await dukkanServisi.kullanicininDukkani(data.user.id);
        
        if (!ownerShop) {
          // Create a test shop for the user
          const { data: shopData, error: shopError } = await supabase
            .from('dukkanlar')
            .insert({
              ad: "Test Kuaför",
              sahibi_id: data.user.id,
              kod: "test-kuafor-123"
            })
            .select()
            .single();
            
          if (shopError) {
            console.error("Error creating test shop:", shopError);
            // Continue anyway
          } else {
            // Create personnel record
            const { error: personnelError } = await supabase
              .from('personel')
              .insert({
                auth_id: data.user.id,
                ad_soyad: "Test User",
                telefon: "555-1234",
                eposta: TEST_EMAIL,
                adres: "Test Adres",
                personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
                maas: 5000,
                calisma_sistemi: "aylik",
                prim_yuzdesi: 10,
                dukkan_id: shopData.id
              });
              
            if (personnelError) {
              console.error("Error creating personnel record:", personnelError);
              // Continue anyway
            }
          }
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
            Test Girişi
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
