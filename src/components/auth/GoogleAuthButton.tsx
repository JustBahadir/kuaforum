
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface GoogleAuthButtonProps {
  mode?: "signin" | "signup";
  onSuccess?: () => void;
  className?: string;
}

export function GoogleAuthButton({ 
  mode = "signin", 
  onSuccess,
  className = ""
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = React.useState(false);

  // Check if we're in an iframe
  const isInIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // If we can't access window.top, we're probably in an iframe
    }
  }, []);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Google OAuth başlatılıyor...");
      console.log("Redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: true, // Important: We'll handle the redirect manually
        }
      });
      
      if (error) {
        console.error("Google auth error:", error);
        if (error.message.includes("provider is not enabled")) {
          toast.error("Google ile giriş henüz etkinleştirilmemiştir. Lütfen Supabase panelinden Google provider'ı aktifleştirin.");
        } else {
          toast.error("Google ile giriş yapılırken bir hata oluştu: " + error.message);
        }
        return;
      }

      if (!data.url) {
        toast.error("Yönlendirme URL'i alınamadı");
        return;
      }

      console.log("Google OAuth yanıtı:", data);
      
      // If we're in an iframe (Lovable preview), open in new window
      if (isInIframe) {
        console.log("iframe içinde tespit edildi, yeni pencerede açılıyor");
        const authWindow = window.open(data.url, "_blank", "width=800,height=600");
        
        if (!authWindow) {
          toast.error("Pop-up penceresi açılamadı. Lütfen pop-up engelleyiciyi kontrol edin.");
          return;
        }
        
        toast.info("Google oturum açma penceresi açıldı. Lütfen yeni pencerede işlemi tamamlayın.");
      } else {
        // Normal browser context, use regular redirect
        console.log("Normal tarayıcı içinde, standart yönlendirme yapılıyor");
        window.location.href = data.url;
      }

    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error(`Google ile ${mode === "signin" ? "giriş" : "kayıt"} sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      onClick={handleGoogleAuth}
      disabled={loading}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{mode === "signin" ? "Google ile Giriş Yap" : "Google ile Kayıt Ol"}</span>
    </Button>
  );
}
