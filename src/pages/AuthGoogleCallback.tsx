
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AuthGoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          console.error("No session found:", sessionError);
          toast.error("Oturum alınamadı, lütfen tekrar deneyin.");
          navigate("/login");
          return;
        }

        console.log("User authenticated, checking if account exists");

        // For login mode - verify that the user has a profile first
        const mode = searchParams.get("mode");
        if (mode === "login") {
          // Check if user profile exists
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          
          if (!profileData) {
            console.error("User has no profile:", user.id);
            
            // Sign out the user since their account doesn't exist
            await supabase.auth.signOut();
            
            // Set error message and redirect to login with error
            navigate("/login?error=account-not-found");
            return;
          }
        }

        // Continue normal flow - create profile if in register mode
        // Fetch user profile after login (maybeSingle to allow no profile yet)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        // If no profile exists, create one from user metadata
        if (!profileData && mode === "register") {
          console.log("Creating new profile for user:", user.id);
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
            setError("Profil oluşturulamadı");
            return;
          }
        }

        // CRITICAL: For staff users, ensure a personel record exists
        const role = user.user_metadata?.role || profileData?.role;
        
        if (role === "staff") {
          // Check if staff record exists
          const { data: staffData, error: staffError } = await supabase
            .from('personel')
            .select('id')
            .eq('auth_id', user.id)
            .maybeSingle();
            
          if (!staffData && mode === "register") {
            // Create a basic personel record if it doesn't exist
            console.log("Creating initial personel record for staff user");
            
            try {
              const { data: newPersonel, error: insertError } = await supabase
                .from('personel')
                .insert([{
                  auth_id: user.id,
                  ad_soyad: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Personel',
                  telefon: user.user_metadata?.phone || '-',
                  eposta: user.email || '-',
                  adres: user.user_metadata?.address || '-',
                  personel_no: `P${Date.now().toString().substring(8)}`,
                  calisma_sistemi: 'Tam Zamanlı',
                  maas: 0,
                  prim_yuzdesi: 0
                }])
                .select();
                
              if (insertError) {
                console.error("Personel kaydı oluşturulurken hata:", insertError);
                toast.error("Personel kaydı oluşturulamadı. Lütfen yöneticinize başvurun.");
              } else {
                console.log("Personel kaydı başarıyla oluşturuldu:", newPersonel);
              }
            } catch (err) {
              console.error("Personel kaydı oluşturma işlemi başarısız:", err);
              toast.error("Personel kaydı oluşturulamadı. Lütfen yöneticinize başvurun.");
            }
          }
        }

        // Check if user is assigned to a shop - CRITICAL CHECK
        const { data: staffData } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        console.log("Staff shop assignment check:", staffData);

        // Redirect based on role and profile completeness
        if (role === "admin") {
          toast.success("Yönetici olarak giriş başarılı!");
          navigate("/shop-home", { replace: true });
        } else if (role === "staff") {
          // CRITICAL: Check if staff is assigned to a shop first
          if (!staffData || !staffData.dukkan_id) {
            // Staff not assigned to any shop - redirect to unassigned-staff
            console.log("Staff not assigned to any shop, redirecting to unassigned-staff");
            toast.success("Giriş başarılı! Henüz bir işletmeye bağlı değilsiniz.");
            navigate("/unassigned-staff", { replace: true });
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
              navigate("/shop-home", { replace: true });
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
        ) : error ? (
          <div className="space-y-4">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p className="font-bold">Hata</p>
              <p>{error}</p>
            </div>
            <Button onClick={() => navigate("/login")}>Giriş Sayfasına Dön</Button>
          </div>
        ) : (
          <p>Yönlendiriliyorsunuz...</p>
        )}
      </div>
    </div>
  );
}
