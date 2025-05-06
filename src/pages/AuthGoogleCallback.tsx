
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountNotFound from "@/components/auth/AccountNotFound";

export default function AuthGoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "login";

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        console.log("Handling auth callback, mode:", mode);

        // Get the current session
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User error:", userError);
          setError("Oturum bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
          setLoading(false);
          return;
        }
        
        // Check if we have a user
        if (!data.user) {
          console.log("No user found in session");
          setError("Giriş bilgileri alınamadı. Lütfen tekrar giriş yapın.");
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }

        console.log("Auth callback - User:", data.user.email);

        // Check for user profile in kullanicilar table
        const { data: kullanici, error: kullaniciError } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("auth_id", data.user.id)
          .maybeSingle();

        if (kullaniciError && kullaniciError.code !== 'PGRST116') {
          console.error("Error fetching user from kullanicilar:", kullaniciError);
          setError("Kullanıcı bilgilerinize erişilirken bir hata oluştu.");
          setLoading(false);
          return;
        }
        
        // If user doesn't exist and came from registration flow or login flow
        if (!kullanici) {
          console.log("No profile found, mode:", mode);
          
          // Try to create a user profile automatically using edge function
          try {
            const { error: edgeFuncError } = await supabase.functions.invoke('handle-user-signup', {
              body: { userId: data.user.id }
            });
            
            if (edgeFuncError) {
              console.error("Error creating initial user profile:", edgeFuncError);
            }
          } catch (edgeFuncErr) {
            console.error("Failed to invoke edge function:", edgeFuncErr);
          }
          
          // Redirect to profile setup regardless
          navigate("/kayit-formu", { replace: true });
          return;
        }
        
        // If user exists in kullanicilar table
        if (kullanici) {
          console.log("Found user in kullanicilar table:", kullanici);
          
          // Check if profile is completed
          if (!kullanici.profil_tamamlandi) {
            console.log("Profile exists but not completed, redirecting to setup");
            navigate("/kayit-formu", { replace: true });
            return;
          }
          
          // If completed, redirect based on role
          if (kullanici.rol === "isletme_sahibi") {
            navigate("/isletme/anasayfa", { replace: true });
          } else if (kullanici.rol === "personel") {
            navigate("/personel/anasayfa", { replace: true });
          } else {
            navigate("/musteri/anasayfa", { replace: true });
          }
          return;
        }

        // This should not happen if all checks above are exhaustive
        setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError("İşlem sırasında bir hata oluştu");
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams, mode]);

  if (accountNotFound) {
    return <AccountNotFound />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white shadow-lg rounded-lg">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-gray-600">Giriş işlemi tamamlanıyor...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full"
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">Giriş Başarılı</h2>
            <p className="text-gray-600">Yönlendiriliyorsunuz...</p>
          </div>
        )}
      </div>
    </div>
  );
}
