
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/ui/app-layout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

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

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session) {
        try {
          // Get user profile to determine role
          const profile = await profilServisi.getir();
          setUserRole(profile?.role || null);
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
              setUserRole(profile?.role || null);
            } catch (error) {
              console.error("Error getting user profile on auth change:", error);
              setUserRole(null);
            }
          } else {
            setUserRole(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkSession();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, requiredRole = null }: { children: React.ReactNode; requiredRole?: string | null }) => {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    }
    
    if (!session) {
      return <Navigate to="/" replace />;
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/customer-profile" element={
              session ? <CustomerProfile /> : <Navigate to="/" replace />
            } />
            
            {/* Protected routes with AppLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Staff-only routes */}
            <Route path="/customers" element={
              <ProtectedRoute requiredRole="staff">
                <AppLayout><Customers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/personnel" element={
              <ProtectedRoute requiredRole="staff">
                <AppLayout><Personnel /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/operations/staff" element={
              <ProtectedRoute requiredRole="staff">
                <AppLayout><StaffOperations /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Customer routes */}
            <Route path="/operations" element={
              <ProtectedRoute requiredRole="customer">
                <AppLayout><CustomerOperations /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <AppLayout><Appointments /></AppLayout>
              </ProtectedRoute>
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
