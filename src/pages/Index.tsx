import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Hata",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Giriş başarılı",
        description: "Hoş geldiniz!",
      });
      
      // TODO: Başarılı girişten sonra dashboard'a yönlendirme eklenecek
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
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
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          
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