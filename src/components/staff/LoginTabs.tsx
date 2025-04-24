
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface LoginTabsProps {
  onSuccess: () => void;
}

export function LoginTabs({ onSuccess }: LoginTabsProps) {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Giriş Yap</TabsTrigger>
        <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4">
        <GoogleAuthButton 
          text="Google ile Giriş Yap"
          className="w-full"
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
        <GoogleAuthButton 
          text="Google ile Kayıt Ol"
          className="w-full"
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
  );
}
