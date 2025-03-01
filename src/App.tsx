
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/ui/app-layout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { toast } from "sonner";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Personnel from "./pages/Personnel";
import CustomerOperations from "./pages/operations/CustomerOperations";
import StaffOperations from "./pages/operations/StaffOperations";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import CustomerProfile from "./pages/CustomerProfile";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session) {
          try {
            // Get user profile to determine role
            const profile = await profilServisi.getir();
            console.log("User profile:", profile);
            setUserRole(profile?.role || null);
            
            // Check if profile is complete (for customers)
            if (profile?.role === 'customer') {
              // Kullanıcının ne zaman oluşturulduğunu kontrol et
              const { data: userData } = await supabase.auth.getUser();
              if (userData.user) {
                // Kullanıcı oluşturulma zamanını kontrol et
                const createdAt = new Date(userData.user.created_at || Date.now());
                const now = new Date();
                const timeDiffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
                
                // Eğer kullanıcı son 5 dakika içinde oluşturulduysa yeni kullanıcı kabul et
                const isNew = timeDiffInMinutes < 5;
                setIsNewUser(isNew);
                
                // Sadece yeni kullanıcılar için profil tamamlama kontrolü yap
                if (isNew) {
                  const isComplete = Boolean(profile.first_name && profile.last_name && profile.phone);
                  setProfileCompleted(isComplete);
                  console.log("Profile completed:", isComplete, "New user:", isNew);
                } else {
                  // Mevcut kullanıcılar için profil tamamlandı kabul et
                  setProfileCompleted(true);
                }
              }
            }
          } catch (error) {
            console.error("Error getting user profile:", error);
            setUserRole(null);
          }
        }
        
        setLoading(false);

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.id);
            setSession(session);
            
            if (session) {
              try {
                // Get user profile on auth change
                const profile = await profilServisi.getir();
                console.log("User profile on auth change:", profile);
                setUserRole(profile?.role || null);
                
                // Check if profile is complete (for customers)
                if (profile?.role === 'customer') {
                  // Oturum açma veya kayıt olma durumunu kontrol et
                  if (event === 'SIGNED_IN') {
                    // Sadece yeni kayıt olanları kontrol et
                    const { data: userData } = await supabase.auth.getUser();
                    if (userData.user) {
                      const createdAt = new Date(userData.user.created_at || Date.now());
                      const now = new Date();
                      const timeDiffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
                      
                      // Yeni kullanıcı mı?
                      const isNew = timeDiffInMinutes < 5 && event === 'SIGNED_UP';
                      setIsNewUser(isNew);
                      
                      // Sadece yeni kullanıcılar için profil tamamlama kontrolü yap
                      if (isNew) {
                        const isComplete = Boolean(profile.first_name && profile.last_name && profile.phone);
                        setProfileCompleted(isComplete);
                      } else {
                        // Mevcut kullanıcılar için profil tamamlandı kabul et
                        setProfileCompleted(true);
                      }
                    }
                  } else {
                    // Mevcut oturum için profil tamamlandı kabul et
                    setProfileCompleted(true);
                  }
                }
              } catch (error) {
                console.error("Error getting user profile on auth change:", error);
                setUserRole(null);
              }
            } else {
              setUserRole(null);
              setProfileCompleted(true);
              setIsNewUser(false);
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleAuthError = () => {
    toast.error("Oturum süreniz doldu veya bir hata oluştu. Lütfen tekrar giriş yapın.");
    supabase.auth.signOut();
    return <Navigate to="/" replace />;
  };

  // Protected route component
  const ProtectedRoute = ({ children, requiredRole = null }: { children: React.ReactNode; requiredRole?: string | null }) => {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    }
    
    if (!session) {
      return <Navigate to="/" replace />;
    }

    // If user role couldn't be determined, handle as an error
    if (userRole === null) {
      return handleAuthError();
    }
    
    // Sadece yeni kayıt olan müşteriler profil sayfasına yönlendirilsin
    if (userRole === 'customer' && isNewUser && !profileCompleted && window.location.pathname !== '/customer-profile') {
      return <Navigate to="/customer-profile" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
      // Redirect to appropriate page based on user role
      if (userRole === 'customer') {
        return <Navigate to="/appointments" replace />;
      } else if (userRole === 'staff') {
        return <Navigate to="/personnel" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  // Customer-only routes
  const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
    return <ProtectedRoute requiredRole="customer">{children}</ProtectedRoute>;
  };

  // Staff-only routes
  const StaffRoute = ({ children }: { children: React.ReactNode }) => {
    return <ProtectedRoute requiredRole="staff">{children}</ProtectedRoute>;
  };

  // Custom sidebar items based on user role
  const getCustomAppLayout = (children: React.ReactNode) => {
    return <AppLayout userRole={userRole}>{children}</AppLayout>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              session ? (
                userRole === 'customer' ? 
                  (isNewUser && !profileCompleted) ? <Navigate to="/customer-profile" replace /> : <Navigate to="/appointments" replace /> :
                userRole === 'staff' ? <Navigate to="/personnel" replace /> :
                <Navigate to="/customer-profile" replace />
              ) : <Dashboard />
            } />
            
            <Route path="/customer-profile" element={
              session ? <CustomerProfile isNewUser={isNewUser} /> : <Navigate to="/" replace />
            } />
            
            {/* Customer-only routes */}
            <Route path="/appointments" element={
              <CustomerRoute>
                {getCustomAppLayout(<Appointments />)}
              </CustomerRoute>
            } />
            
            <Route path="/operations" element={
              <CustomerRoute>
                {getCustomAppLayout(<CustomerOperations />)}
              </CustomerRoute>
            } />
            
            {/* Staff-only routes */}
            <Route path="/dashboard" element={
              <StaffRoute>
                {getCustomAppLayout(<Dashboard />)}
              </StaffRoute>
            } />
            
            <Route path="/customers" element={
              <StaffRoute>
                {getCustomAppLayout(<Customers />)}
              </StaffRoute>
            } />
            
            <Route path="/personnel" element={
              <StaffRoute>
                {getCustomAppLayout(<Personnel />)}
              </StaffRoute>
            } />
            
            <Route path="/operations/staff" element={
              <StaffRoute>
                {getCustomAppLayout(<StaffOperations />)}
              </StaffRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
