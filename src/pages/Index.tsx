import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    // TODO: Bu kısım veritabanı entegrasyonundan sonra güncellenecek
    if (password === "demo") { // Geçici olarak demo şifresi
      toast({
        title: "Giriş başarılı",
        description: "Hoş geldiniz!",
      });
    } else {
      toast({
        title: "Hata",
        description: "Yanlış şifre",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Kuaför Yönetim Sistemi</h1>
        
        <div className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            Giriş Yap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;