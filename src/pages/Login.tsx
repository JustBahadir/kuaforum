
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Home } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Improved: Listen auth state changes to handle session updates
  useEffect(() => {
    let isMounted = true;

    // Setup a listener for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user) {
          const userRole = session.user.user_metadata?.role;

          if (userRole === "admin") {
            if (isMounted) navigate("/shop-home", { replace: true });
          } else if (userRole === "staff") {
            if (isMounted) navigate("/staff-profile", { replace: true });
          } else {
            if (isMounted) navigate("/profile-setup", { replace: true });
          }
        }
        
        if (event === "SIGNED_OUT") {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    // Check existing session once on mount
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        toast.error("Oturum kontrolü sırasında hata oluştu");
      }
      if (data.session?.user) {
        const userRole = data.session.user.user_metadata?.role;
        if (userRole === "admin") {
          navigate("/shop-home", { replace: true });
        } else if (userRole === "staff") {
          navigate("/staff-profile", { replace: true });
        } else {
          navigate("/profile-setup", { replace: true });
        }
      } else {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("E-posta ve şifre gerekli");
      return;
    }

    setLoginLoading(true);

    try {
      // Check if the email is a developer email
      if (email === "ergun@gmail.com" || email === "nimet@gmail.com") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Giriş yapılamadı: " + error.message);
          setLoginLoading(false);
          return;
        }

        toast.success("Giriş başarılı!");

        // Redirect based on known roles
        if (email === "ergun@gmail.com") {
          navigate("/shop-home");
        } else if (email === "nimet@gmail.com") {
          navigate("/staff-profile");
        }
      } else {
        toast.error("Bu e-posta adresi ile giriş yapamazsınız. Lütfen Google ile giriş yapın.");
        setLoginLoading(false);
      }
    } catch (error: any) {
      toast.error("Giriş yapılırken hata oluştu: " + error.message);
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-center">Kuaför Randevu Sistemi</CardTitle>
          <CardDescription className="text-center">Giriş yapın veya hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <GoogleAuthButton />

            <div className="flex items-center">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">veya</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600">Sadece yönetici girişi</p>
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Giriş yapılıyor..." : "Yönetici Girişi"}
                </Button>
              </form>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Ana Sayfaya Dön</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
