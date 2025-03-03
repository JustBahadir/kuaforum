
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { shouldRedirect, getRedirectPath } from "@/lib/auth/routeProtection";
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
      const user = await authService.getCurrentUser();
      
      if (!user) {
        setUserName("Değerli Müşterimiz");
        setUserRole(null);
        setIsAuthenticated(false);
        setDukkanId(null);
        return;
      }

      setIsAuthenticated(true);
      
      // Get user role
      const role = await profileService.getUserRole();
      setUserRole(role);
      console.log("User role from refreshProfile:", role);
      
      // Get shop ID if admin
      const shopId = await profileService.getUserShopId(user.id, role || '');
      setDukkanId(shopId);
      
      // Get formatted user name
      const name = await profileService.getUserNameWithTitle();
      setUserName(name);
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
        
        try {
          const user = await authService.getCurrentUser();
          
          if (!user) {
            setIsAuthenticated(false);
            
            // Check if current route should redirect
            if (shouldRedirect(false, null, location.pathname)) {
              navigate("/staff-login");
            }
            return;
          }
          
          setIsAuthenticated(true);
          
          // Get user role
          const role = await profileService.getUserRole();
          setUserRole(role);
          console.log("User role from loadUserData:", role);
          
          // Get shop ID if admin
          const shopId = await profileService.getUserShopId(user.id, role || '');
          setDukkanId(shopId);
          
          // Check if current route needs redirect based on role
          if (shouldRedirect(true, role, location.pathname)) {
            navigate(getRedirectPath(true, role, location.pathname));
          }
          
          // Get formatted user name
          await refreshProfile();
        } catch (error) {
          console.error("Error in auth check:", error);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Set up auth state change listener
    const subscription = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
          await refreshProfile();
          
          // Check role and redirect accordingly
          const role = await profileService.getUserRole();
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
      await authService.signOut();
      setIsAuthenticated(false);
      setUserRole(null);
      setDukkanId(null);
      
      // Always navigate to the home page
      navigate("/");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
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
