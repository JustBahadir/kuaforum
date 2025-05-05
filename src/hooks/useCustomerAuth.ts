
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Hook for managing customer authentication state
 */
export function useCustomerAuth() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isletmeId, setIsletmeId] = useState<string | null>(null);
  const [dukkanId, setDukkanId] = useState<string | null>(null); // For backward compatibility
  
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        setUser(session?.user || null);
        setUserId(session?.user?.id || null);
        
        if (session?.user) {
          // Get user profile
          fetchUserProfile(session.user.id);
          
          // Get user role from metadata or profile
          const role = session.user.user_metadata?.role;
          setUserRole(role || null);
        } else {
          setUserName("");
          setUserRole(null);
          setProfileData(null);
          setIsletmeId(null);
          setDukkanId(null);
        }
        
        setLoading(false);
      }
    );

    // Check current session on load
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check current session
  const checkSession = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      setIsAuthenticated(!!data.session);
      setUser(data.session?.user || null);
      setUserId(data.session?.user?.id || null);
      
      if (data.session?.user) {
        fetchUserProfile(data.session.user.id);
        
        // Get user role
        const role = data.session.user.user_metadata?.role;
        setUserRole(role || null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      // Try profiles table first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError);
      }
      
      if (profile) {
        setProfileData(profile);
        
        // Set user name from profile
        setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Kullanıcı");
        
        // Try to get business if user is business owner
        if (profile.role === 'admin' || profile.role === 'isletme_sahibi') {
          fetchUserBusiness(userId);
        }
        
        return;
      }
      
      // If no profile in profiles table, try kullanicilar table
      const { data: kullanici, error: kullaniciError } = await supabase
        .from("kullanicilar")
        .select("*")
        .eq("kimlik", userId)
        .maybeSingle();
        
      if (kullaniciError && kullaniciError.code !== 'PGRST116') {
        console.error("Error fetching user from kullanicilar:", kullaniciError);
      }
      
      if (kullanici) {
        setProfileData(kullanici);
        
        // Set user name from kullanici
        setUserName(`${kullanici.ad || ''} ${kullanici.soyad || ''}`.trim() || "Kullanıcı");
        
        // Try to get business if user is business owner
        if (kullanici.rol === 'isletme_sahibi') {
          fetchUserBusiness(userId);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };
  
  // Fetch user's business
  const fetchUserBusiness = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("isletmeler")
        .select("kimlik")
        .eq("sahip_kimlik", userId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching business:", error);
      }
      
      if (data) {
        setIsletmeId(data.kimlik);
        setDukkanId(data.kimlik); // For backward compatibility
      }
    } catch (error) {
      console.error("Error in fetchUserBusiness:", error);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return {
    isAuthenticated,
    userName,
    userRole,
    loading,
    user,
    userId,
    isletmeId,
    dukkanId, // For backward compatibility
    profileData,
    handleLogout
  };
}

export default useCustomerAuth;
