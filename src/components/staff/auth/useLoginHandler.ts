
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useLoginHandler(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      setLoginError("Lütfen e-posta ve şifre girin");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Giriş denenecek e-posta:", email);
      
      // Supabase ile giriş işlemi
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Giriş hatası:", error.message);
        setLoginError("Giriş yapılamadı. E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }
      
      if (!data || !data.user) {
        console.error("Kullanıcı verileri alınamadı");
        setLoginError("Kullanıcı bilgileri alınamadı.");
        setLoading(false);
        return;
      }
      
      // Başarılı giriş
      console.log("Kullanıcı başarıyla giriş yaptı:", data.user.id);
      
      // Kullanıcı rolünü kontrol et
      const userRole = data.user.user_metadata?.role;
      console.log("Kullanıcı rolü:", userRole);
      
      if (userRole === 'staff' || userRole === 'admin') {
        console.log("Personel/admin girişi başarılı. /shop-home sayfasına yönlendiriliyor.");
        toast.success("Giriş başarılı!");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Beklenmeyen bir hata:", error.message);
      setLoginError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    loginError,
    handleLogin
  };
}
