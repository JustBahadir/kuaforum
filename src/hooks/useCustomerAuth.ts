
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useCustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dukkanId, setDukkanId] = useState<number>(0);
  const [dukkanAdi, setDukkanAdi] = useState("");
  const [userRole, setUserRole] = useState("");
  
  // Determine active tab based on current route
  const pathname = location.pathname;
  const activeTab = pathname.includes("/profile") ? "profile" : 
                   pathname.includes("/appointments") ? "appointments" : 
                   pathname.includes("/services") ? "services" :
                   pathname.includes("/settings") ? "settings" : "home";

  // Check session status
  const checkSession = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data?.session) {
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        // Fetch profile information
        await refreshProfile();
      } else {
        resetProfile();
      }
    } catch (error) {
      console.error("Session check failed:", error);
      resetProfile();
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh user profile data
  const refreshProfile = async () => {
    try {
      if (!user?.id) return;
      
      // Fetch user profile from database
      const { data, error } = await supabase
        .from("musteri_profil")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setProfile(data);
        setUserName(data.ad_soyad || data.eposta || "Customer");
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  };
  
  // Reset profile state
  const resetProfile = () => {
    setUser(null);
    setProfile(null);
    setUserName("");
    setIsAuthenticated(false);
    setDukkanId(0);
    setDukkanAdi("");
    setUserRole("");
  };
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      resetProfile();
      navigate("/login");
      toast.success("Başarıyla çıkış yapıldı");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };
  
  // Initialize auth state
  useEffect(() => {
    checkSession();
    
    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          await refreshProfile();
        } else {
          resetProfile();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return {
    user,
    profile,
    userRole,
    loading,
    userName,
    isAuthenticated,
    dukkanId,
    dukkanAdi,
    activeTab,
    checkSession,
    refreshProfile,
    resetProfile,
    handleLogout,
  };
}
