
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Verify if user has staff role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error("Error checking user role:", profileError);
        throw new Error("Kullanıcı bilgileri alınamadı");
      }
      
      if (profileData?.role !== 'staff') {
        // Sign out if not staff
        await supabase.auth.signOut();
        throw new Error("Bu giriş sadece kuaför personeli içindir. Müşteri girişi için ana sayfayı kullanın.");
      }
      
      toast.success("Kuaför girişi başarılı!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      toast.error("Giriş yapılamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast("Şifre sıfırlama bağlantısı e-posta adresinize gönderilecek");
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="staff-email">E-posta</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            id="staff-email" 
            type="email" 
            placeholder="personel@salonyonetim.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-password">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            id="staff-password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="link" 
          className="text-xs text-purple-600"
          onClick={handleForgotPassword}
        >
          Şifremi Unuttum
        </Button>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
