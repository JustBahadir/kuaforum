
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, AlertTriangle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
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
    } else if (errorParam === "account-exists") {
      setErrorMessage("Bu hesap zaten kayıtlı. Otomatik giriş yapılıyor...");
      setRedirecting(true);
      // Redirect to auth page after 2 seconds
      setTimeout(() => {
        navigate("/auth-google-callback?mode=login");
      }, 2000);
    }
  }, [searchParams, navigate]);

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
            <Alert variant={redirecting ? "default" : "destructive"} className={redirecting ? "border-blue-500 bg-blue-50" : "border-red-500 bg-red-50"}>
              {redirecting ? <AlertTriangle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription className={redirecting ? "text-blue-700" : "text-red-700"}>
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
            </TabsContent>
          </Tabs>
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
