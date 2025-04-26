
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, InfoIcon, AlertTriangle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Set initial active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    }
    
    // Check for error parameters in URL
    const errorParam = searchParams.get("error");
    if (errorParam === "account-not-found") {
      setErrorMessage("Bu hesap bulunamadı. Lütfen kayıt olun veya farklı bir hesapla giriş yapın.");
    } else if (errorParam === "unexpected") {
      setErrorMessage("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [searchParams]);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Admin login handler (independent below tabs)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminEmail || !adminPassword) {
      setAdminError("E-posta ve şifre gerekli.");
      return;
    }
    setAdminLoading(true);
    try {
      if (adminEmail === "ergun@gmail.com" || adminEmail === "nimet@gmail.com") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        if (error) {
          setAdminError("Giriş yapılamadı: " + error.message);
          setAdminLoading(false);
          return;
        }
        setAdminError(null);
        toast.success("Giriş başarılı!");

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        const role = user?.user_metadata?.role;

        if (role === "staff") {
          const { data: staffData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', user.id)
            .maybeSingle();

          if (!staffData || !staffData.dukkan_id) {
            toast.success("Başarıyla giriş yapıldı. Henüz bir işletmeye bağlı değilsiniz.");
            navigate("/unassigned-staff", { replace: true });
          } else {
            toast.success("Başarıyla giriş yapıldı.");
            navigate("/shop-home", { replace: true });
          }
        } else if (role === "admin") {
          toast.success("Yönetici olarak giriş başarılı!");
          navigate("/shop-home");
        } else {
          setAdminError("Bu e-posta ile yönetici/işletmeci veya personel erişimi yok.");
        }
      } else {
        setAdminError("Bu e-posta ile giriş yapamazsınız. Lütfen Google ile giriş yapın.");
      }
    } catch (error: any) {
      setAdminError("Giriş yapılırken hata oluştu: " + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRedirectToRegister = () => {
    setActiveTab("register");
    // Update URL without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "register");
    window.history.pushState({}, "", url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-center font-semibold">
            Kuaför Randevu Sistemi
          </CardTitle>
          <CardDescription className="text-center">
            Giriş yapın veya hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive" className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "login" | "register")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-200 p-1">
              <TabsTrigger value="login" className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${activeTab === "login" ? "bg-white text-purple-700 shadow-md" : "text-gray-500"}`}>
                GİRİŞ YAP
              </TabsTrigger>
              <TabsTrigger value="register" className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${activeTab === "register" ? "bg-white text-purple-700 shadow-md" : "text-gray-500"}`}>
                KAYIT OL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="text-center mb-4 font-semibold text-gray-700">
                GOOGLE İLE GİRİŞ YAP
              </div>
              <GoogleAuthButton 
                text="Google ile Giriş Yap"
                className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                redirectTo={window.location.origin + "/auth-google-callback?mode=login"}
              />
              
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  Yakında Apple ile giriş özelliği de eklenecektir.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="text-center mb-4 font-semibold text-gray-700">
                GOOGLE İLE KAYIT OL
              </div>
              <GoogleAuthButton 
                text="Google ile Kayıt Ol"
                className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                redirectTo={window.location.origin + "/auth-google-callback?mode=register"}
              />
              
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  Yakında Apple ile kayıt özelliği de eklenecektir.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Admin Login Section */}
          <div className="mt-8">
            <div className="text-center mb-2 font-semibold text-gray-700">
              Sadece yönetici girişi
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-3 max-w-md mx-auto">
              {adminError && <div className="bg-red-50 text-red-700 p-3 rounded text-center text-sm">
                {adminError}
              </div>}
              <div>
                <Label htmlFor="adminEmail">E-posta</Label>
                <Input id="adminEmail" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@example.com" required />
              </div>
              <div>
                <Label htmlFor="adminPassword">Şifre</Label>
                <Input id="adminPassword" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="********" required />
              </div>
              <Button type="submit" variant="outline" className="w-full" disabled={adminLoading}>
                {adminLoading ? "Giriş yapılıyor..." : "Yönetici Girişi"}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
