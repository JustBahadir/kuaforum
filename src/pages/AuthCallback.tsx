
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleOAuthCallback = async () => {
      try {
        // Get the session to see if we're authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        // Check if we have a valid session after callback
        if (session) {
          // Check if the user has a complete profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('phone, gender, role')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Profile check error:", profileError);
          }
          
          // If the profile is incomplete or doesn't exist, redirect to complete profile
          if (!profile || !profile.phone || !profile.gender || !profile.role) {
            toast.info("Lütfen profilinizi tamamlayın");
            navigate("/register-profile");
            return;
          }
          
          // If the profile is complete, redirect based on role
          if (profile.role === 'admin' || profile.role === 'business_owner') {
            navigate("/shop-home");
          } else if (profile.role === 'staff') {
            // Check if staff is assigned to a shop
            const { data: personelData } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', session.user.id)
              .single();
              
            if (personelData && personelData.dukkan_id) {
              navigate("/shop-home");
            } else {
              navigate("/customer-dashboard"); // This should be changed to profile page later
            }
          } else {
            navigate("/customer-dashboard");
          }
        } else {
          // No session, redirect to login
          navigate("/staff-login");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message);
        toast.error("Giriş sırasında bir hata oluştu.");
        // Redirect to login after error
        setTimeout(() => {
          navigate("/staff-login");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Giriş yapılıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 p-4 rounded-md mb-4">
          <p className="text-red-700">Bir hata oluştu: {error}</p>
        </div>
        <p>Ana sayfaya yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
