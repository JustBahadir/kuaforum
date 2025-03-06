
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

/**
 * Hook for managing authentication state
 */
export function useAuthState() {
  const [userName, setUserName] = useState("Değerli Müşterimiz");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "";

  // Auth state change listener setup
  useEffect(() => {
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
  }, [navigate, location.pathname]);

  // Reset authentication state
  const resetAuthState = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName("Değerli Müşterimiz");
    setInitialLoadDone(false);
  };

  return {
    userName,
    setUserName,
    userRole, 
    setUserRole,
    loading,
    setLoading,
    isAuthenticated,
    setIsAuthenticated,
    initialLoadDone,
    setInitialLoadDone,
    authCheckInProgress, 
    setAuthCheckInProgress,
    activeTab,
    resetAuthState,
  };
}
