
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthGoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);

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
          navigate("/auth");
          return;
        }

        console.log("Auth callback - User:", user.email);

        // Check if the user profile exists and is completed
        const { data: kullanici, error: kullaniciError } = await supabase
          .from("kullanicilar")
          .select("profil_tamamlandi")
          .eq("kimlik", user.id)
          .maybeSingle();

        if (kullaniciError) {
          console.error("Kullanıcı bilgileri alınamadı:", kullaniciError);
          // Instead of throwing an error, we'll assume the profile needs to be completed
        }

        // Redirect to profile setup if not completed or no profile exists
        if (!kullanici || !kullanici.profil_tamamlandi) {
          console.log("Profil tamamlanmamış, profil-kurulum sayfasına yönlendiriliyor");
          navigate("/profil-kurulum", { replace: true });
          return;
        }

        // If profile is completed, redirect based on role
        const { data: kullaniciRol } = await supabase
          .from("kullanicilar")
          .select("rol")
          .eq("kimlik", user.id)
          .single();

        if (kullaniciRol?.rol === "isletme_sahibi") {
          navigate("/isletme/anasayfa", { replace: true });
        } else {
          navigate("/personel/anasayfa", { replace: true });
        }

      } catch (error: any) {
        console.error("Auth callback error:", error);
        // Instead of showing an error, redirect to profile setup
        navigate("/profil-kurulum", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white shadow-lg rounded-lg">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Giriş işlemi tamamlanıyor...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/auth")} 
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
