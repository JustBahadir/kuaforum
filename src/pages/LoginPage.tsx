
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });

      if (error) {
        toast.error("Google ile giriş başarısız");
        console.error("Google login error:", error);
      }
    } catch (error) {
      toast.error("Giriş yapılamadı");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Kuaförüm</CardTitle>
          <CardDescription>
            Giriş yapın veya hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Button 
                className="w-full flex items-center justify-center gap-2"
                variant="outline" 
                disabled={loading}
                onClick={handleGoogleLogin}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.785 9.169c0-.738-.06-1.276-.189-1.834h-8.42v3.328h4.942c-.1.828-.638 2.073-1.834 2.91l-.016.112 2.662 2.063.185.018c1.694-1.565 2.67-3.867 2.67-6.597"/>
                  <path fill="#34A853" d="M9.175 17.938c2.422 0 4.455-.797 5.94-2.172l-2.83-2.193c-.758.528-1.774.897-3.11.897-2.372 0-4.385-1.564-5.102-3.727l-.105.01-2.769 2.142-.036.1c1.475 2.93 4.504 4.943 8.012 4.943"/>
                  <path fill="#FBBC05" d="M4.073 10.743c-.19-.558-.3-1.156-.3-1.774 0-.618.11-1.216.29-1.774l-.005-.119-2.811-2.18-.092.044C.547 6.09.142 7.59.142 9.171c0 1.58.405 3.081 1.102 4.33l2.83-2.758"/>
                  <path fill="#EB4335" d="M9.175 3.636c1.683 0 2.82.728 3.47 1.335l2.531-2.471C13.62.9 11.598 0 9.175 0 5.667 0 2.638 2.013 1.163 4.943l2.9 2.258c.72-2.164 2.734-3.565 5.112-3.565"/>
                </svg>
                <span>{loading ? "Yükleniyor..." : "Google ile Giriş Yap"}</span>
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <Button 
                className="w-full flex items-center justify-center gap-2"
                variant="outline" 
                disabled={loading}
                onClick={handleGoogleLogin}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.785 9.169c0-.738-.06-1.276-.189-1.834h-8.42v3.328h4.942c-.1.828-.638 2.073-1.834 2.91l-.016.112 2.662 2.063.185.018c1.694-1.565 2.67-3.867 2.67-6.597"/>
                  <path fill="#34A853" d="M9.175 17.938c2.422 0 4.455-.797 5.94-2.172l-2.83-2.193c-.758.528-1.774.897-3.11.897-2.372 0-4.385-1.564-5.102-3.727l-.105.01-2.769 2.142-.036.1c1.475 2.93 4.504 4.943 8.012 4.943"/>
                  <path fill="#FBBC05" d="M4.073 10.743c-.19-.558-.3-1.156-.3-1.774 0-.618.11-1.216.29-1.774l-.005-.119-2.811-2.18-.092.044C.547 6.09.142 7.59.142 9.171c0 1.58.405 3.081 1.102 4.33l2.83-2.758"/>
                  <path fill="#EB4335" d="M9.175 3.636c1.683 0 2.82.728 3.47 1.335l2.531-2.471C13.62.9 11.598 0 9.175 0 5.667 0 2.638 2.013 1.163 4.943l2.9 2.258c.72-2.164 2.734-3.565 5.112-3.565"/>
                </svg>
                <span>{loading ? "Yükleniyor..." : "Google ile Kayıt Ol"}</span>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
