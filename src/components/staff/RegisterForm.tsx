
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First register the user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'staff'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Then add to personel table
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .insert([
            {
              email: email,
              ad_soyad: `${firstName} ${lastName}`,
              telefon: phone,
              durum: 'aktif'
            }
          ]);
          
        if (personelError) throw personelError;
        
        toast.success("Kuaför kaydı başarılı! Giriş yapabilirsiniz.");
        onSuccess();
      } else {
        toast.warning("Kaydınız oluşturuldu. E-posta onayı gerekebilir.");
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      toast.error("Kayıt yapılamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">E-posta</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            id="register-email" 
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
        <Label htmlFor="register-password">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            id="register-password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-firstName">Ad</Label>
        <Input 
          id="register-firstName" 
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-lastName">Soyad</Label>
        <Input 
          id="register-lastName" 
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-phone">Telefon</Label>
        <Input 
          id="register-phone" 
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
      >
        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
      </Button>
    </form>
  );
}
