
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { shouldRedirect, getRedirectPath } from "@/lib/auth/routeProtection";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export function useCustomerAuth() {
  const [userName, setUserName] = useState("Değerli Müşterimiz");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [dukkanAdi, setDukkanAdi] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(false);
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
      
      // Get role from user metadata for reliable role checking
      const role = user.user_metadata?.role || await profileService.getUserRole();
      setUserRole(role);
      console.log("User role from refreshProfile:", role);
      
      if (role === 'admin') {
        try {
          const userShop = await dukkanServisi.kullanicininDukkani(user.id);
          if (userShop) {
            setDukkanId(userShop.id);
            setDukkanAdi(userShop.ad);
          } else if (location.pathname.includes('/personnel') || location.pathname.includes('/appointments')) {
            // Önce toast göster, sonra dükkan oluşturma sayfasına yönlendir
            toast.error("Dükkan bilgileriniz bulunamadı. Lütfen dükkan bilgilerinizi oluşturun.");
            
            // Kısa bir gecikme ekleyelim ki toast görülebilsin
            setTimeout(() => {
              navigate("/create-shop");
            }, 2000);
          }
        } catch (error) {
          console.error("Dükkan bilgisi alınırken hata:", error);
        }
      } else if (role === 'staff') {
        try {
          const staffShop = await dukkanServisi.personelAuthIdDukkani(user.id);
          if (staffShop) {
            setDukkanId(staffShop.id);
            setDukkanAdi(staffShop.ad);
          } else if (location.pathname.includes('/personnel')) {
            toast.error("Dükkan bilgileriniz bulunamadı. Lütfen yönetici ile iletişime geçin.");
          }
        } catch (error) {
          console.error("Personel dükkan bilgisi alınırken hata:", error);
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
    // Eğer auth check zaten devam ediyorsa, çift kontrolü önle
    if (authCheckInProgress) return;
    
    async function checkAuthStatus() {
      if (initialLoadDone) return; // Bir kez çalıştır, sonra çık
      
      try {
        setLoading(true);
        setAuthCheckInProgress(true);
        
        const user = await authService.getCurrentUser();
        console.log("Current user check result:", user ? "User found" : "No user");
        
        if (!user) {
          setIsAuthenticated(false);
          setUserRole(null);
          
          // Ana sayfada veya login sayfalarında ise yönlendirme yapma
          if (location.pathname === "/" || 
              location.pathname === "/login" || 
              location.pathname === "/admin") {
            console.log("On public page, not redirecting");
          } else {
            console.log("Not authenticated, redirecting to home");
            navigate("/");
          }
        } else {
          setIsAuthenticated(true);
          
          // Get role from user metadata for more reliable role checking
          const role = user.user_metadata?.role || await profileService.getUserRole();
          setUserRole(role);
          console.log("User role determined:", role);
          
          // Bu kontrolü bir kez yapıyoruz, ama sonsuz döngü oluşmayacak şekilde
          if (shouldRedirect(true, role, location.pathname)) {
            const redirectPath = getRedirectPath(true, role, location.pathname);
            console.log(`Redirecting from ${location.pathname} to ${redirectPath}`);
            navigate(redirectPath);
          } else {
            console.log("No redirection needed");
          }
          
          await refreshProfile();
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setIsAuthenticated(false);
      } finally {
        setInitialLoadDone(true);
        setAuthCheckInProgress(false);
        setLoading(false);
      }
    }
    
    checkAuthStatus();
    
    // Auth state change listener'ı tek seferlik işlemden ayırıyoruz
    const { data } = authService.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed event:", event);
        if (event === 'SIGNED_IN') {
          console.log("SIGNED_IN event detected");
          setIsAuthenticated(true);
          
          const user = await authService.getCurrentUser();
          if (user) {
            // Get role directly from metadata for reliability
            const role = user.user_metadata?.role || await profileService.getUserRole();
            setUserRole(role);
            
            await refreshProfile();
            
            // Redirect based on role
            if (role === 'admin') {
              navigate("/admin/dashboard");
            } else if (role === 'staff') {
              navigate("/admin/dashboard");
            } else if (role === 'customer') {
              if (location.pathname.includes('/admin')) {
                toast.info("Müşteri hesabı ile giriş yaptınız. Personel girişi için personel hesabı kullanmalısınız.");
                navigate("/customer-dashboard");
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("SIGNED_OUT event detected");
          setUserName("Değerli Müşterimiz");
          setUserRole(null);
          setIsAuthenticated(false);
          setDukkanId(null);
          setDukkanAdi(null);
          
          // Çıkış yapıldığında ana sayfaya yönlendir
          if (location.pathname !== "/") {
            navigate("/");
          }
        }
      }
    );
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate, location.pathname, initialLoadDone, authCheckInProgress]);
  
  const handleLogout = async () => {
    try {
      console.log("Çıkış yapılıyor...");
      await authService.signOut();
      console.log("Çıkış başarılı, state güncelleniyor...");
      setIsAuthenticated(false);
      setUserRole(null);
      setDukkanId(null);
      setDukkanAdi(null);
      
      // Oturum kapatıldığında initialLoadDone değerini sıfırla
      // böylece yeniden giriş yapıldığında kontroller tekrar yapılır
      setInitialLoadDone(false);
      
      navigate("/");
      console.log("Ana sayfaya yönlendirildi");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
    }
  };
  
  // Oturumu sıfırlama fonksiyonu ekleyelim
  const resetSession = async () => {
    try {
      await authService.signOut();
      localStorage.clear(); // Tüm yerel depolamayı temizle
      sessionStorage.clear(); // Tüm oturum depolamasını temizle
      
      // State'i sıfırla
      setIsAuthenticated(false);
      setUserRole(null);
      setDukkanId(null);
      setDukkanAdi(null);
      setUserName("Değerli Müşterimiz");
      setInitialLoadDone(false);
      
      // Sayfayı yenile - son çare olarak
      window.location.href = '/';
    } catch (error) {
      console.error("Oturum sıfırlanırken hata:", error);
    }
  };
  
  return { 
    userName, 
    loading, 
    activeTab, 
    handleLogout,
    resetSession,
    refreshProfile, 
    userRole,
    isAuthenticated,
    dukkanId,
    dukkanAdi
  };
}
