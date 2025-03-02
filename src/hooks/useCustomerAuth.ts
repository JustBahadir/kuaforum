
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

  // Check authentication and fetch user profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/");
        return;
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
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

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
    handleLogout
  };
}
