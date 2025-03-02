
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

interface LoginTabsProps {
  onSuccess: () => void;
}

export function LoginTabs({ onSuccess }: LoginTabsProps) {
  const [activeTab, setActiveTab] = useState("login");

  const handleRegisterSuccess = () => {
    setActiveTab("login");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Giriş Yap</TabsTrigger>
        <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm onSuccess={onSuccess} />
      </TabsContent>
      
      <TabsContent value="register">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </TabsContent>
    </Tabs>
  );
}
