
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Personnel from "./pages/Personnel";
import CustomerOperations from "./pages/operations/CustomerOperations";
import StaffOperations from "./pages/operations/StaffOperations";
import Appointments from "./pages/Appointments";
import Auth from "./pages/Auth";
import StaffRegister from "./pages/StaffRegister";
import NotFound from "./pages/NotFound";
import { getUserRole } from "./utils/auth";

const queryClient = new QueryClient();

const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const role = await getUserRole();
      setCanAccess(role === 'staff' || role === 'admin');
    };
    checkAccess();
  }, []);

  if (canAccess === null) return null;
  return canAccess ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/staff-register" element={<StaffRegister />} />
            <Route 
              path="/dashboard" 
              element={session ? <Dashboard /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/customers" 
              element={
                <StaffRoute>
                  <Customers />
                </StaffRoute>
              } 
            />
            <Route 
              path="/personnel" 
              element={
                <StaffRoute>
                  <Personnel />
                </StaffRoute>
              } 
            />
            <Route 
              path="/operations/staff" 
              element={
                <StaffRoute>
                  <StaffOperations />
                </StaffRoute>
              } 
            />
            <Route 
              path="/operations" 
              element={session ? <CustomerOperations /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/appointments" 
              element={session ? <Appointments /> : <Navigate to="/auth" replace />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
