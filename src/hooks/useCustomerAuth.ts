
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useCustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  // Update activeTab based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/profile')) {
      setActiveTab("profile");
    } else if (path.includes('/appointments')) {
      setActiveTab("appointments");
    } else if (path.includes('/services')) {
      setActiveTab("services");
    } else if (path.includes('/settings')) {
      setActiveTab("settings");
    } else {
      setActiveTab("home");
    }
  }, [location.pathname]);

  // Function to fetch user profile data
  const fetchProfileData = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/");
        return false;
      }

      try {
        // Get user profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', data.session.user.id)
          .single();
          
        if (profile && (profile.first_name || profile.last_name)) {
          setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        } else {
          setUserName("Değerli Müşterimiz");
        }
        return true;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return false;
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
      return false;
    }
  };

  // Check authentication and fetch user profile on initial load
  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  // Refresh profile data - Can be called after profile updates
  const refreshProfile = async () => {
    const success = await fetchProfileData();
    if (success) {
      toast.success("Profil bilgileri güncellendi");
    }
    return success;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
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
    refreshProfile
  };
}
