
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { shouldRedirect, getRedirectPath } from "@/lib/auth/routeProtection";
import { toast } from "sonner";

export function useCustomerAuth() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [dukkanAdi, setDukkanAdi] = useState<string | null>(null);
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
        setDukkanAdi(null);
        return;
      }

      setIsAuthenticated(true);
      
      // Get user role
      const role = await profileService.getUserRole();
      setUserRole(role);
      console.log("User role from refreshProfile:", role);
      
      // Get shop ID and name based on role
      if (role === 'admin') {
        // If admin, get the shop they own
        const userShop = await dukkanServisi.kullanicininDukkani(user.id);
        if (userShop) {
          setDukkanId(userShop.id);
          setDukkanAdi(userShop.ad);
        }
      } else if (role === 'staff') {
        // If staff, get shop from personnel record
        const staffShop = await dukkanServisi.personelAuthIdDukkani(user.id);
        if (staffShop) {
          setDukkanId(staffShop.id);
          setDukkanAdi(staffShop.ad);
        }
      }
      
      // Get formatted user name
      const name = await profileService.getUserNameWithTitle();
      setUserName(name);
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setUserName("Değerli Müşterimiz");
      setIsAuthenticated(false);
      setDukkanId(null);
      setDukkanAdi(null);
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
            
            // Gerektiğinde ana sayfaya yönlendirme
            if (shouldRedirect(false, null, location.pathname)) {
              navigate("/");
            }
            return;
          }
          
          setIsAuthenticated(true);
          
          // Get user role
          const role = await profileService.getUserRole();
          setUserRole(role);
          console.log("User role from loadUserData:", role);
          
          // Get shop info based on role
          if (role === 'admin') {
            // If admin, get the shop they own
            const userShop = await dukkanServisi.kullanicininDukkani(user.id);
            if (userShop) {
              setDukkanId(userShop.id);
              setDukkanAdi(userShop.ad);
            } else if (location.pathname.includes('/personnel')) {
              // Admin without shop shouldn't access personnel pages
              toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
              navigate("/");
              return;
            }
          } else if (role === 'staff') {
            // If staff, get shop from personnel record
            const staffShop = await dukkanServisi.personelAuthIdDukkani(user.id);
            if (staffShop) {
              setDukkanId(staffShop.id);
              setDukkanAdi(staffShop.ad);
            } else if (location.pathname.includes('/personnel')) {
              // Staff without shop shouldn't access personnel pages
              toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
              navigate("/");
              return;
            }
          }
          
          // Check if current route needs redirect based on role
          if (shouldRedirect(true, role, location.pathname)) {
            navigate(getRedirectPath(true, role, location.pathname));
          }
          
          // Get formatted user name
          await refreshProfile();
        } catch (error) {
          console.error("Error in auth check:", error);
          setIsAuthenticated(false);
          // Herhangi bir hata durumunda en azından ana sayfaya yönlendir
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Set up auth state change listener
    const subscription = authService.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed event:", event);
        if (event === 'SIGNED_IN') {
          console.log("SIGNED_IN event detected");
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
          console.log("SIGNED_OUT event detected");
          setUserName("Değerli Müşterimiz");
          setUserRole(null);
          setIsAuthenticated(false);
          setDukkanId(null);
          setDukkanAdi(null);
          
          // Oturumu kapattıktan sonra ana sayfaya yönlendir
          navigate("/");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);
  
  const handleLogout = async () => {
    try {
      console.log("Çıkış yapılıyor...");
      await authService.signOut();
      console.log("Çıkış başarılı, state güncelleniyor...");
      setIsAuthenticated(false);
      setUserRole(null);
      setDukkanId(null);
      setDukkanAdi(null);
      
      // Always navigate to the home page
      navigate("/");
      console.log("Ana sayfaya yönlendirildi");
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
    dukkanId,
    dukkanAdi
  };
}
