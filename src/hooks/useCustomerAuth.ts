
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
  const [initialLoadDone, setInitialLoadDone] = useState(false); // Ekledik
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "";

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
      
      const role = await profileService.getUserRole();
      setUserRole(role);
      console.log("User role from refreshProfile:", role);
      
      if (role === 'admin') {
        const userShop = await dukkanServisi.kullanicininDukkani(user.id);
        if (userShop) {
          setDukkanId(userShop.id);
          setDukkanAdi(userShop.ad);
        } else if (location.pathname.includes('/personnel')) {
          toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
          navigate("/");
          return;
        }
      } else if (role === 'staff') {
        const staffShop = await dukkanServisi.personelAuthIdDukkani(user.id);
        if (staffShop) {
          setDukkanId(staffShop.id);
          setDukkanAdi(staffShop.ad);
        } else if (location.pathname.includes('/personnel')) {
          toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
          navigate("/");
          return;
        }
      }
      
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

  // Ana useEffect hook'unu, sonsuz döngüyü önleyecek şekilde düzenliyoruz
  useEffect(() => {
    async function loadUserData() {
      if (initialLoadDone) return; // Bir kez çalıştır, sonra çık
      
      try {
        setLoading(true);
        
        try {
          const user = await authService.getCurrentUser();
          
          if (!user) {
            setIsAuthenticated(false);
            
            // Ana sayfada veya login sayfalarında ise yönlendirme yapma
            if (location.pathname === "/" || 
                location.pathname === "/login" || 
                location.pathname === "/staff-login") {
              // Yalnızca bu sayfaları yüklemeye devam et
            } else if (shouldRedirect(false, null, location.pathname)) {
              navigate("/");
            }
            
            setInitialLoadDone(true);
            setLoading(false);
            return;
          }
          
          setIsAuthenticated(true);
          
          const role = await profileService.getUserRole();
          setUserRole(role);
          console.log("User role from loadUserData:", role);
          
          if (role === 'admin') {
            const userShop = await dukkanServisi.kullanicininDukkani(user.id);
            if (userShop) {
              setDukkanId(userShop.id);
              setDukkanAdi(userShop.ad);
            } else if (location.pathname.includes('/personnel')) {
              toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
              navigate("/");
              setInitialLoadDone(true);
              setLoading(false);
              return;
            }
          } else if (role === 'staff') {
            const staffShop = await dukkanServisi.personelAuthIdDukkani(user.id);
            if (staffShop) {
              setDukkanId(staffShop.id);
              setDukkanAdi(staffShop.ad);
            } else if (location.pathname.includes('/personnel')) {
              toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
              navigate("/");
              setInitialLoadDone(true);
              setLoading(false);
              return;
            }
          }
          
          // Bu kontrolü bir kez yapıyoruz, ama sonsuz döngü oluşmayacak şekilde
          if (shouldRedirect(true, role, location.pathname)) {
            const redirectPath = getRedirectPath(true, role, location.pathname);
            navigate(redirectPath);
          }
          
          await refreshProfile();
        } catch (error) {
          console.error("Error in auth check:", error);
          setIsAuthenticated(false);
          navigate("/");
        }
      } finally {
        setInitialLoadDone(true);
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Auth state change listener'ı tek seferlik işlemden ayırıyoruz
    const { data } = authService.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed event:", event);
        if (event === 'SIGNED_IN') {
          console.log("SIGNED_IN event detected");
          setIsAuthenticated(true);
          await refreshProfile();
          
          const role = await profileService.getUserRole();
          if ((role === 'staff' || role === 'admin') && location.pathname.includes('/staff-login')) {
            navigate("/personnel");
          } else if (role === 'customer' && location.pathname.includes('/staff-login')) {
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
          
          navigate("/");
        }
      }
    );
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate, location.pathname, initialLoadDone]); // initialLoadDone bağımlılığını ekledik
  
  const handleLogout = async () => {
    try {
      console.log("Çıkış yapılıyor...");
      await authService.signOut();
      console.log("Çıkış başarılı, state güncelleniyor...");
      setIsAuthenticated(false);
      setUserRole(null);
      setDukkanId(null);
      setDukkanAdi(null);
      
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
