
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthGoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      setLoading(true);

      try {
        // Supabase automatically processes the OAuth callback and sets session

        const { data, error: sessionError } = await supabase.auth.getSession();

        const session = data?.session ?? null;
        const user = session?.user ?? null;

        if (sessionError || !session || !user) {
          toast.error("Oturum alınamadı, lütfen tekrar deneyin.");
          navigate("/login");
          return;
        }

        // Fetch user profile after login
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          // If profile not found, create basic profile? 
          // But normally, handle redirect to profile setup
          const newProfileRes = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                first_name: user.user_metadata?.first_name || "",
                last_name: user.user_metadata?.last_name || "",
                phone: user.user_metadata?.phone || "",
                gender: user.user_metadata?.gender || "",
                role: user.user_metadata?.role || "customer",
                address: user.user_metadata?.address || "",
              },
            ]);
          if (newProfileRes.error) {
            console.error("Profil oluşturulamadı:", newProfileRes.error);
          }
        }

        // Get query param "mode": login or register
        const mode = searchParams.get("mode");

        // Check for duplicate user on register mode (avoid duplicate OAuth signup)
        if (mode === "register") {
          // Check if user already exists by email in profiles
          // Note: user.email can be null in some cases; fallback logic
          if (user.email && typeof user.email === "string") {
            const { data: existingUser, error: existingUserError } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", user.email)
              .single();

            if (existingUserError && existingUserError.code !== "PGRST116") {
              console.error("Kullanıcı kontrolü sırasında hata:", existingUserError);
            }

            if (existingUser) {
              toast.error("Bu mail zaten kayıtlı. Lütfen Giriş Yap sekmesini kullanınız.");
              navigate("/login");
              return;
            }
          }
        }

        // After login or register, redirect user based on role
        const role = user.user_metadata?.role;

        if (role === "admin") {
          toast.success("Yönetici olarak giriş başarılı!");
          navigate("/shop-home");
        } else if (role === "staff") {
          toast.success("Personel olarak giriş başarılı!");
          navigate("/staff-profile");
        } else if (role === "customer") {
          // If profile incomplete, redirect to profile-setup
          if (!profileData || !profileData.first_name || !profileData.last_name || !profileData.phone) {
            toast.success("Profil bilgilerinizi tamamlayınız.");
            navigate("/profile-setup");
          } else {
            toast.success("Giriş başarılı!");
            navigate("/customer-dashboard");
          }
        } else {
          toast.success("Giriş başarılı!");
          navigate("/profile-setup");
        }
      } catch (error: any) {
        console.error("Google callback işlenirken hata:", error);
        toast.error("Giriş işlemi sırasında hata oluştu.");
        navigate("/login");
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

