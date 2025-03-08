
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
      
      // Kullanıcı rolünü kontrol et
      const userRole = data.user.user_metadata?.role;
      console.log("Kullanıcı rolü:", userRole);
      
      if (userRole === 'staff' || userRole === 'admin') {
        console.log("Personel/admin girişi başarılı. Yönlendirme yapılacak.");
        toast.success("Giriş başarılı!");
        
        // Burada bir kısa gecikme ekleyelim - önce toast gösterilsin
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        console.error("Kullanıcının rolü personel veya admin değil:", userRole);
        setLoginError("Bu hesap personel girişi için yetkilendirilmemiş. Lütfen personel hesabınızla giriş yapın.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Beklenmeyen bir hata:", error.message);
      setLoginError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
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
