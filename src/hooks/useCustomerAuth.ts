
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { getGenderTitle } from "@/lib/supabase/services/profileServices/profileTypes";
import { toast } from "sonner";

export function useCustomerAuth() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "";

  // Refresh user profile data
  const refreshProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserName("Değerli Müşterimiz");
        setUserRole(null);
        setIsAuthenticated(false);
        setDukkanId(null);
        return;
      }

      setIsAuthenticated(true);
      
      // Get user role
      const role = await profilServisi.getUserRole();
      setUserRole(role);
      console.log("User role from refreshProfile:", role);
      
      // If admin, get shop ID
      if (role === 'admin') {
        try {
          const dukkan = await dukkanServisi.kullanicininDukkani(user.id);
          if (dukkan) {
            setDukkanId(dukkan.id);
          }
        } catch (error) {
          console.error("Dükkan bilgisi alınamadı:", error);
        }
      }
      
      // First try to get name from user metadata
      if (user.user_metadata && (user.user_metadata.first_name)) {
        const metaFirstName = user.user_metadata.first_name || '';
        const metaGender = user.user_metadata.gender || '';
        
        const genderTitle = getGenderTitle(metaGender);
        
        if (metaFirstName && genderTitle) {
          setUserName(`${metaFirstName} ${genderTitle}`);
          return;
        } else if (metaFirstName) {
          setUserName(metaFirstName);
          return;
        }
      }
      
      // If metadata doesn't have the name, try from profile table
      try {
        const profile = await profilServisi.getir();
        if (profile) {
          const firstName = profile.first_name || "";
          const genderTitle = getGenderTitle(profile.gender);
          
          if (firstName && genderTitle) {
            setUserName(`${firstName} ${genderTitle}`);
          } else if (firstName) {
            setUserName(firstName);
          } else {
            setUserName("Değerli Müşterimiz");
          }
        } else {
          setUserName("Değerli Müşterimiz");
        }
      } catch (profileError) {
        console.error("Error getting profile:", profileError);
        setUserName("Değerli Müşterimiz");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setUserName("Değerli Müşterimiz");
      setIsAuthenticated(false);
      setDukkanId(null);
    }
  };

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth error:", error);
          toast.error("Oturum bilgileriniz alınamadı");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        if (!user) {
          setIsAuthenticated(false);
          setLoading(false);
          // Ana sayfaya ve login sayfalarına her zaman erişime izin ver
          if (location.pathname !== "/" && 
              location.pathname !== "/login" && 
              location.pathname !== "/staff-login" &&
              !location.pathname.startsWith("/customer-dashboard") &&
              (location.pathname.includes('/personnel') || 
               location.pathname.includes('/dashboard'))) {
            navigate("/staff-login");
          }
          return;
        }
        
        setIsAuthenticated(true);
        
        // Get user role
        const role = await profilServisi.getUserRole();
        setUserRole(role);
        console.log("User role from loadUserData:", role);
        
        // If admin, get shop ID
        if (role === 'admin') {
          try {
            const dukkan = await dukkanServisi.kullanicininDukkani(user.id);
            if (dukkan) {
              setDukkanId(dukkan.id);
            }
          } catch (error) {
            console.error("Dükkan bilgisi alınamadı:", error);
          }
        }
        
        // Kullanıcı rolünü kontrol et, ancak ana sayfaya ve müşteri sayfalarına erişime izin ver
        if ((role === 'staff' || role === 'admin') && location.pathname.includes('/customer')) {
          navigate("/personnel");
        } else if (role === 'customer' && 
                  (location.pathname.includes('/personnel') || 
                   location.pathname.includes('/dashboard'))) {
          navigate("/customer-dashboard");
        }
        
        // Get profile data
        await refreshProfile();
      } catch (error) {
        console.error("Error in auth check:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "has session" : "no session");
        if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
          await refreshProfile();
          
          // Check role and redirect accordingly
          const role = await profilServisi.getUserRole();
          if ((role === 'staff' || role === 'admin') && location.pathname.includes('/staff-login')) {
            navigate("/personnel");
          } else if (role === 'customer' && location.pathname.includes('/staff-login')) {
            // Staff login page but customer role - redirect to customer dashboard
            navigate("/customer-dashboard");
            toast.info("Müşteri hesabı ile giriş yaptınız. Personel girişi için personel hesabı kullanmalısınız.");
          }
        } else if (event === 'SIGNED_OUT') {
          setUserName("Değerli Müşterimiz");
          setUserRole(null);
          setIsAuthenticated(false);
          setDukkanId(null);
          
          // Oturumu kapattıktan sonra ana sayfaya yönlendir
          if (location.pathname !== "/" && 
              location.pathname !== "/login" && 
              location.pathname !== "/staff-login") {
            navigate("/");
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
      setIsAuthenticated(false);
      setUserRole(null);
      setDukkanId(null);
      
      // Always navigate to the home page
      navigate("/");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };
  
  return { 
    userName, 
    loading, 
    activeTab, 
    handleLogout, 
    refreshProfile, 
    userRole,
    isAuthenticated,
    dukkanId
  };
}
