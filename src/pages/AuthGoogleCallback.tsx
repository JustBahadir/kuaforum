
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
          setError("Kullanıcı bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
          setLoading(false);
          return;
        }

        // Get the auth mode (login/register)
        const mode = searchParams.get("mode");
        console.log("Auth callback mode:", mode, "User:", user.email);

        // Check if the profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name")
          .eq("id", user.id)
          .maybeSingle();

        // If error fetching profile (not "not found" error)
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile error:", profileError);
          setError("Profil bilgilerinize erişilemedi. Lütfen tekrar deneyin.");
          setLoading(false);
          return;
        }

        // First time login or registration - redirect to profile setup
        if (!profile) {
          console.log("No profile found, redirecting to profile setup");
          navigate("/profile-setup");
          return;
        }

        // Profile exists but first_name and last_name are empty - redirect to profile setup
        if ((!profile.first_name || !profile.last_name) && profile.first_name !== "0" && profile.last_name !== "0") {
          console.log("Profile exists but incomplete, redirecting to profile setup");
          navigate("/profile-setup");
          return;
        }

        // Profile complete, redirect based on role - using any to bypass type issues
        if (profile.role === "admin" || profile.role === "isletme_sahibi") {
          navigate("/isletme-anasayfa");
        } else if (profile.role === "staff" || profile.role === "personel") {
          // For now, just redirect to staff placeholder
          navigate("/atanmamis-personel");
        } else {
          // Default to landing page
          navigate("/");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError("Bir hata oluştu: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-lg">Giriş yapılıyor...</p>
        <p className="text-sm text-gray-500">Lütfen bekleyin, yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}
