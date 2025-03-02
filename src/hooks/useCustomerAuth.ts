
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { getGenderTitle } from "@/lib/supabase/services/profileServices/profileTypes";

export function useCustomerAuth() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "";

  // Refresh user profile data
  const refreshProfile = async () => {
    try {
      const profile = await profilServisi.getir();
      if (profile) {
        const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
        const genderTitle = getGenderTitle(profile.gender);
        
        if (fullName && genderTitle) {
          setUserName(`${fullName} ${genderTitle}`);
        } else if (fullName) {
          setUserName(fullName);
        } else {
          setUserName("Değerli Müşterimiz");
        }
      } else {
        setUserName("Değerli Müşterimiz");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
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
    await supabase.auth.signOut();
    navigate("/login");
  };
  
  return { userName, loading, activeTab, handleLogout, refreshProfile };
}
