
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { getGenderTitle } from "@/lib/supabase/services/profileServices/profileTypes";
import { toast } from "sonner";

export function useCustomerAuth() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        return;
      }

      setIsAuthenticated(true);
      
      // Get user role
      const role = await profilServisi.getUserRole();
      setUserRole(role);
      
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
          return;
        }
        
        if (!user) {
          setIsAuthenticated(false);
          // Only navigate to login if we're on a protected route
          if (location.pathname.includes('/personnel') || 
              location.pathname.includes('/dashboard')) {
            navigate("/staff-login");
          }
          return;
        }
        
        setIsAuthenticated(true);
        
        // Get user role
        const role = await profilServisi.getUserRole();
        setUserRole(role);
        console.log("User role:", role);
        
        // If user is staff but trying to access customer routes or vice versa
        if (role === 'staff' && location.pathname.includes('/customer')) {
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
        } else if (event === 'SIGNED_OUT') {
          setUserName("Değerli Müşterimiz");
          setUserRole(null);
          setIsAuthenticated(false);
          
          // If on a protected route, redirect to login
          if (location.pathname.includes('/personnel') || 
              location.pathname.includes('/dashboard')) {
            navigate("/staff-login");
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
    isAuthenticated
  };
}
