
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { getGenderTitle } from "@/lib/supabase/services/profileServices/profileTypes";
import { toast } from "sonner";

export function useCustomerAuth() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "";

  // Refresh user profile data
  const refreshProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserName("Değerli Müşterimiz");
        return;
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
          navigate("/login");
          return;
        }
        
        if (!user) {
          navigate("/login");
          return;
        }
        
        // Get profile data
        await refreshProfile();
      } catch (error) {
        console.error("Error in auth check:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
      // Navigate to the root route instead of /login
      navigate("/");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };
  
  return { userName, loading, activeTab, handleLogout, refreshProfile };
}
