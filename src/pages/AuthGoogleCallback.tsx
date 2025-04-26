
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthGoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      setLoading(true);

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        const user = session?.user ?? null;

        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/login");
          return;
        }

        // Get the auth mode (login/register)
        const mode = searchParams.get("mode");

        if (mode === "register") {
          // For registration, directly go to profile setup without any checks
          navigate("/profile-setup");
          return;
        }

        // For login mode - verify that the user has a profile
        if (!user) {
          navigate("/login?error=account-not-found");
          return;
        }

        // Check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
          
        if (!profileData || profileError) {
          // User doesn't exist - clear auth and redirect to login with error
          await supabase.auth.signOut();
          navigate("/login?error=account-not-found");
          return;
        }

        // User exists and logged in successfully
        const role = profileData.role;
        
        if (role === "admin") {
          navigate("/shop-home");
        } else if (role === "staff") {
          navigate("/staff-profile");
        } else {
          // Default to shop-home as we're removing customer-dashboard
          navigate("/shop-home");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        navigate("/login?error=unexpected");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 bg-white rounded-md shadow-md">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p>Giriş bilgileri doğrulanıyor...</p>
          </>
        ) : (
          <p>Yönlendiriliyorsunuz...</p>
        )}
      </div>
    </div>
  );
}
