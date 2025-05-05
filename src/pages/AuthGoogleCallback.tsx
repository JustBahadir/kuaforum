
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
  const [accountExists, setAccountExists] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        console.log("Handling auth callback");

        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Oturum bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
          setLoading(false);
          return;
        }
        
        const session = sessionData?.session;
        const user = session?.user;

        // Check if we have a user
        if (!user) {
          console.log("No user found in session");
          setAccountNotFound(true);
          setLoading(false);
          return;
        }

        console.log("Auth callback - User:", user.email);

        // First check for profiles table (current structure)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile from profiles:", profileError);
        }

        // Then check for kullanicilar table (new structure)
        const { data: kullanici, error: kullaniciError } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("kimlik", user.id)
          .maybeSingle();

        if (kullaniciError && kullaniciError.code !== 'PGRST116') {
          console.error("Error fetching user from kullanicilar:", kullaniciError);
        }
        
        // If user doesn't exist in either table, redirect to profile setup
        if (!profile && !kullanici) {
          console.log("No profile found in either table");
          setAccountNotFound(true);
          setLoading(false);
          return;
        }
        
        // If account exists in profiles (older structure)
        if (profile) {
          console.log("Found profile in profiles table:", profile);
          
          // Check if profile is completed
          if (profile.profil_tamamlandi === false || !profile.first_name) {
            console.log("Profile exists but not completed, redirecting to setup");
            navigate("/profil-kurulum", { replace: true });
            return;
          }
          
          // If completed, redirect based on role
          const role = profile.role || 'customer';
          
          if (role === "isletme_sahibi" || role === "admin") {
            navigate("/isletme/anasayfa", { replace: true });
          } else if (role === "personel" || role === "staff") {
            navigate("/personel/anasayfa", { replace: true });
          } else {
            navigate("/musteri/anasayfa", { replace: true });
          }
          return;
        }
        
        // If account exists in kullanicilar (newer structure)
        if (kullanici) {
          console.log("Found user in kullanicilar table:", kullanici);
          
          // Check if profile is completed
          if (!kullanici.profil_tamamlandi) {
            console.log("Profile exists but not completed, redirecting to setup");
            navigate("/profil-kurulum", { replace: true });
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
  }, [navigate, searchParams]);

  if (accountNotFound) {
    return <AccountNotFound />;
  }
  
  if (accountExists) {
    return <AccountNotFound accountExists={true} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-blue-50">
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
