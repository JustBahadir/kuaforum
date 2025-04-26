
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import AccountNotFound from "@/components/auth/AccountNotFound";

export default function AuthGoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [accountNotFound, setAccountNotFound] = useState(false);
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
          // For registration, directly go to profile setup
          navigate("/profile-setup");
          return;
        }

        // For login mode - verify that the user has a profile
        if (!user) {
          setAccountNotFound(true);
          setLoading(false);
          return;
        }

        // Check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
          
        if (!profileData || profileError) {
          setAccountNotFound(true);
          setLoading(false);
          return;
        }

        // User exists and logged in successfully
        const role = profileData.role;
        
        if (role === "admin") {
          navigate("/shop-home");
        } else if (role === "staff") {
          // Check if staff has a dukkan_id
          const { data: staffData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', user.id)
            .maybeSingle();

          if (!staffData?.dukkan_id) {
            navigate("/unassigned-staff");
          } else {
            navigate("/staff-profile");
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setAccountNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  if (accountNotFound) {
    return <AccountNotFound />;
  }

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
