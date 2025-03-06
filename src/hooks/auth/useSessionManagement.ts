
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";

/**
 * Hook for managing user session operations
 */
export function useSessionManagement(
  resetAuthState: () => void,
  resetProfile: () => void,
  setInitialLoadDone: (done: boolean) => void
) {
  const navigate = useNavigate();

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    try {
      console.log("Çıkış yapılıyor...");
      await authService.signOut();
      console.log("Çıkış başarılı, state güncelleniyor...");
      
      // Reset all states
      resetAuthState();
      resetProfile();
      
      // Oturum kapatıldığında initialLoadDone değerini sıfırla
      // böylece yeniden giriş yapıldığında kontroller tekrar yapılır
      setInitialLoadDone(false);
      
      navigate("/");
      console.log("Ana sayfaya yönlendirildi");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
    }
  };
  
  /**
   * Resets the entire session 
   */
  const resetSession = async () => {
    try {
      await authService.signOut();
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset all states
      resetAuthState();
      resetProfile();
      setInitialLoadDone(false);
      
      // Sayfayı yenile - son çare olarak
      window.location.href = '/';
    } catch (error) {
      console.error("Oturum sıfırlanırken hata:", error);
    }
  };

  return {
    handleLogout,
    resetSession
  };
}
