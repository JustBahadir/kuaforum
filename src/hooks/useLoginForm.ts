
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authResponseData, setAuthResponseData] = useState<any>(null);

  // Reset states
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setLoginError(null);
  };

  // Standard login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen e-posta ve şifre girin");
      return;
    }

    setLoading(true);
    setLoginError(null);
    
    try {
      console.log("Attempting login with:", email);
      
      // Doğrudan Supabase auth ile oturum açma işlemini gerçekleştir
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Save response for debugging
      setAuthResponseData({ data, error });
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol ediniz. Eğer şifrenizi hatırlamıyorsanız 'Şifremi Unuttum' butonunu kullanabilirsiniz.");
          toast.error("Geçersiz e-posta veya şifre");
        } else {
          setLoginError(`Giriş yapılamadı: ${error.message}`);
          toast.error("Giriş yapılamadı: " + error.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        throw new Error("Kullanıcı verisi alınamadı");
      }
      
      toast.success("Giriş başarılı!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setLoginError(`Giriş yapılamadı: ${error.message}`);
      toast.error("Giriş yapılamadı: " + error.message);
      setAuthResponseData({ error });
    } finally {
      setLoading(false);
    }
  };

  // Send password reset email
  const handleSendResetEmail = async (resetEmail: string) => {
    if (!resetEmail) {
      toast.error("Lütfen e-posta adresinizi girin");
      return false;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/staff-login`,
      });
      
      if (error) throw error;
      
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");
      return true;
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Şifre sıfırlama e-postası gönderilemedi: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    loginError,
    authResponseData,
    handleLogin,
    handleSendResetEmail,
    resetForm
  };
}
