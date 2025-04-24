
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
        console.log("Processing Google auth callback");
        // Get session (no type args passed, to fix TS issues)
        const { data, error: sessionError } = await supabase.auth.getSession();

        const session = data?.session ?? null;
        const user = session?.user ?? null;

        if (sessionError || !session || !user) {
          toast.error("Oturum alınamadı, lütfen tekrar deneyin.");
          navigate("/login");
          return;
        }

        console.log("User authenticated, role:", user.user_metadata?.role);

        // Fetch user profile after login (maybeSingle to allow no profile yet)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        // If no profile exists, create one from user metadata
        if (!profileData) {
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

        // Check if user is assigned to a shop - CRITICAL CHECK
        const { data: staffData } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        console.log("Staff shop assignment check:", staffData);

        // Get mode query param
        const mode = searchParams.get("mode");

        // Check duplicate user for register mode (by id)
        if (mode === "register") {
          const checkUser = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (checkUser.error && checkUser.error.code !== "PGRST116") {
            console.error("Kullanıcı kontrolü sırasında hata:", checkUser.error);
          }

          if (checkUser.data) {
            toast.error("Bu kullanıcı zaten kayıtlı. Lütfen Giriş Yap sekmesini kullanınız.");
            navigate("/login");
            return;
          }
        }

        // Redirect based on role and profile completeness
        const role = user.user_metadata?.role;

        if (role === "admin") {
          toast.success("Yönetici olarak giriş başarılı!");
          navigate("/shop-home");
        } else if (role === "staff") {
          // CRITICAL: Check if staff is assigned to a shop first
          if (!staffData || !staffData.dukkan_id) {
            // Staff not assigned to any shop - redirect to unassigned-staff
            console.log("Staff not assigned to any shop, redirecting to unassigned-staff");
            toast.success("Giriş başarılı! Henüz bir işletmeye bağlı değilsiniz.");
            navigate("/unassigned-staff");
          } else {
            // Staff assigned to a shop
            if (
              !profileData ||
              !profileData.first_name ||
              !profileData.last_name ||
              !profileData.phone
            ) {
              toast.success("Profil bilgilerinizi tamamlayınız.");
              navigate("/profile-setup");
            } else {
              toast.success("Giriş başarılı!");
              navigate("/staff-profile");
            }
          }
        } else if (role === "customer") {
          // Customer 
          if (
            !profileData ||
            !profileData.first_name ||
            !profileData.last_name ||
            !profileData.phone
          ) {
            toast.success("Profil bilgilerinizi tamamlayınız.");
            navigate("/profile-setup");
          } else {
            toast.success("Giriş başarılı!");
            navigate("/customer-dashboard");
          }
        } else {
          // Fallback
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
