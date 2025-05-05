
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, AlertTriangle } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "login" | "register")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">GİRİŞ YAP</TabsTrigger>
              <TabsTrigger value="register">KAYIT OL</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <GoogleAuthButton 
                text="Google ile Giriş Yap"
                redirectTo={window.location.origin + "/auth-google-callback?mode=login"}
              />
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <GoogleAuthButton 
                text="Google ile Kayıt Ol"
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
