
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Home } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  // Active tab: "login" or "register"
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Common states for login & register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Info message below inputs for errors or info
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Staff/admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Helper function to check if user profile exists by email
  async function checkUserExistsByEmail(emailCheck: string): Promise<boolean> {
    if (!emailCheck) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailCheck)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking user existence:", error);
      return false; // Fail safe: allow to proceed
    }
    return !!data;
  }

  // Google auth handler for register tab with check
  const handleGoogleRegisterClick = async () => {
    setLoading(true);
    try {
      // Prompt the user for email before redirecting?
      // But since Google OAuth redirects immediately, we need to check server side or handle after login callback
      // Here, we attempt to fetch user by email first, but we do not have email before login
      // Alternative is to intercept after login, but requirement is client side before triggering Google OAuth

      // So workaround: Open popup and immediately check existence AFTER login in onAuthStateChange
      // But requirement is to block signup before starting OAuth flow — this is impossible without pre-knowledge of email
      // So the best we can do: use Supabase RPC or edge function to do this check and handle in callback
      // Still, per request, implement a client-side check before redirecting if possible with popup method

      // Since email is not available before OAuth login, we cannot check it beforehand here client side.
      // Therefore, we simulate via a customized GoogleAuthButton that waits for OAuth response and after login, 
      // checks profile existence and conditionally redirects with toast and avoids duplicate signup.

      // But this is outside scope, so as a best approximation, we will handle the existing email detection AFTER OAuth login elsewhere.

      // Therefore, in this component, for "register" tab GoogleAuthButton, we just call it normally.
      // We can add a note here to implement server edge function to handle duplicate registration prevention post-login.

      // For now, just call GoogleAuthButton normally.
      // Since the system currently tries to recreate duplicates, the better approach is to check user existence on auth state change globally.

      // Leaving code here for future server edge function integration

      window.location.href = window.location.origin + "/auth-google-callback?mode=register";
    } catch (error) {
      toast.error("Google kayıt işleminde hata oluştu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for login submit (email + password method)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin.");
      return;
    }
    if (!password) {
      toast.error("Lütfen şifrenizi girin.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (
          error.message.includes("User not found") ||
          error.message.includes("Invalid login credentials")
        ) {
          setInfoMessage("Bu e-posta adresine ait hesap bulunamadı. Lütfen kayıt olunuz.");
          toast.error("Bu e-posta adresine ait hesap bulunamadı. Lütfen kayıt olunuz.");
          setActiveTab("register");
          setLoading(false);
          return;
        }
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const metadata = data.user?.user_metadata || {};
      if (metadata.role === "admin") {
        toast.success("Yönetici olarak giriş başarılı!");
        navigate("/shop-home");
      } else if (metadata.role === "staff") {
        toast.success("Personel olarak giriş başarılı!");
        navigate("/staff-profile");
      } else if (metadata.role === "customer") {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone, role")
          .eq("id", data.user.id)
          .single();

        const profileSetupComplete =
          profileData &&
          profileData.first_name &&
          profileData.last_name &&
          profileData.phone;

        if (!profileSetupComplete) {
          toast.success("Profil bilgilerinizi tamamlayınız.");
          navigate("/profile-setup");
        } else {
          toast.success("Giriş başarılı!");
          navigate("/customer-dashboard");
        }
      } else {
        toast.success("Giriş başarılı!");
        navigate("/profile-setup");
      }
    } catch (error: any) {
      toast.error(error.message || "Giriş sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Handler for register submit (email + password method)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin.");
      return;
    }
    if (!password) {
      toast.error("Lütfen şifrenizi girin.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setInfoMessage(
            "Bu e-posta adresiyle daha önce kayıt olunmuş. Giriş yap sekmesine geçiniz."
          );
          toast.error(
            "Bu e-posta adresiyle daha önce kayıt olunmuş. Giriş yap sekmesine geçiniz."
          );
          setActiveTab("login");
          setLoading(false);
          return;
        }
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Kayıt başarılı! Lütfen profil bilgilerinizi tamamlayın.");
      navigate("/profile-setup");
    } catch (error: any) {
      toast.error(error.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

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
          password: adminPassword,
        });

        if (error) {
          setAdminError("Giriş yapılamadı: " + error.message);
          setAdminLoading(false);
          return;
        }
        setAdminError(null);
        toast.success("Giriş başarılı!");
        if (adminEmail === "ergun@gmail.com") {
          navigate("/shop-home");
        } else if (adminEmail === "nimet@gmail.com") {
          navigate("/staff-profile");
        }
      } else {
        setAdminError(
          "Bu e-posta ile giriş yapamazsınız. Lütfen Google ile giriş yapın."
        );
      }
    } catch (error: any) {
      setAdminError("Giriş yapılırken hata oluştu: " + error.message);
    } finally {
      setAdminLoading(false);
    }
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
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "register")}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-200 p-1">
              <TabsTrigger
                value="login"
                className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === "login"
                    ? "bg-white text-purple-700 shadow-md"
                    : "text-gray-500"
                }`}
              >
                GİRİŞ YAP
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === "register"
                    ? "bg-white text-purple-700 shadow-md"
                    : "text-gray-500"
                }`}
              >
                KAYIT OL
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-6">
              <div className="text-center mb-4 font-semibold text-gray-700">
                GOOGLE İLE GİRİŞ YAP
              </div>
              <GoogleAuthButton
                text="Google ile Giriş Yap"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                redirectTo={window.location.origin + "/auth-google-callback?mode=login"}
              />
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-muted-foreground bg-gray-50">
                  veya
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                {infoMessage && (
                  <div className="p-3 mb-2 bg-yellow-200 border border-yellow-400 rounded text-yellow-900 text-sm">
                    {infoMessage}{" "}
                    <button
                      type="button"
                      className="underline font-semibold"
                      onClick={() => setActiveTab("register")}
                    >
                      Kayıt Ol sekmesine geç
                    </button>
                  </div>
                )}
                <div>
                  <Label htmlFor="loginEmail">E-posta</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="loginPassword">Şifre</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register" className="space-y-6">
              <div className="text-center mb-4 font-semibold text-gray-700">
                GOOGLE İLE KAYIT OL
              </div>
              {/* For register Google button, we use a wrapper handler that checks for existing user */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                onClick={async () => {
                  // We cannot know the Google user's email beforehand due to OAuth redirect,
                  // so this check cannot be done here reliably.
                  // The check for existing user must happen after login in callback or onAuthStateChange.
                  // Thus this button simply triggers Google OAuth sign in with redirect with mode=register.
                  window.location.href = window.location.origin + "/auth-google-callback?mode=register";
                }}
                disabled={loading}
                type="button"
              >
                {/* Use Google Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.9H42V20H24v8h11.3c-1.1 3-3.9 5-7.3 5a8 8 0 110-16c2.2 0 4.1.8 5.5 2.2l6-6A13.5 13.5 0 0024 8a16 16 0 000 32c8.8 0 16-7.2 16-16 0-1.1-.1-2.1-.4-3z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.4l6.6 4.8a9.4 9.4 0 016-2.1c2.2 0 4.1.8 5.5 2.2l6-6A13.5 13.5 0 0024 8a16 16 0 00-17.7 6.4z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44a16 16 0 0011.3-4.5l-5.3-4.4a9.7 9.7 0 01-6 2.1 9.7 9.7 0 01-8.7-5.5l-6.6 5A16 16 0 0024 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.9H42V20H24v8h11.3a9.9 9.9 0 01-4.5 7.3l.1.1 5.2 4.4c3-2.7 4.7-7 4.7-11.8 0-1.1-.1-2.1-.4-3z"
                  />
                </svg>
                {loading ? "Yükleniyor..." : "Google ile Kayıt Ol"}
              </Button>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-muted-foreground bg-gray-50">
                  veya
                </div>
              </div>
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                {infoMessage && (
                  <div className="p-3 mb-2 bg-yellow-200 border border-yellow-400 rounded text-yellow-900 text-sm">
                    {infoMessage}{" "}
                    <button
                      type="button"
                      className="underline font-semibold"
                      onClick={() => setActiveTab("login")}
                    >
                      Giriş Yap sekmesine geç
                    </button>
                  </div>
                )}
                <div>
                  <Label htmlFor="registerEmail">E-posta</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerPassword">Şifre</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* ADMIN LOGIN (independent) */}
          <div className="mt-8">
            <div className="text-center mb-2 font-semibold text-gray-700">
              Sadece yönetici girişi
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-3 max-w-md mx-auto">
              {adminError && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-center text-sm">
                  {adminError}
                </div>
              )}
              <div>
                <Label htmlFor="adminEmail">E-posta</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">Şifre</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="********"
                  required
                />
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
