
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { BsGoogle } from "react-icons/bs";
import { toast } from "sonner";

interface GoogleAuthButtonProps {
  redirectTo?: string;
  className?: string;
  text?: string;
}

export function GoogleAuthButton({ 
  redirectTo = `${window.location.origin}/auth-google-callback?mode=login`,
  className = "",
  text = "Google ile Devam Et"
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log("Redirecting to:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error("Google giriş hatası:", error);
        toast.error("Google ile giriş sırasında bir hata oluştu");
        throw error;
      }
    } catch (error) {
      console.error("Google girişi sırasında beklenmeyen hata:", error);
      toast.error("Google ile giriş sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      <BsGoogle className="h-5 w-5" />
      <span>{loading ? "Yükleniyor..." : text}</span>
    </Button>
  );
}

export default GoogleAuthButton;
