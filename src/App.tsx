
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import CustomerDashboard from "@/pages/CustomerDashboard";
import Login from "@/pages/Login";
import CustomerAppointments from "@/pages/CustomerDashboard/CustomerAppointments";
import CustomerServices from "@/pages/CustomerDashboard/CustomerServices";
import CustomerProfile from "@/pages/CustomerDashboard/CustomerProfile";
import Personnel from "@/pages/Personnel";
import Appointments from "@/pages/Appointments";
import Services from "@/pages/Services";
import StaffLogin from "./pages/StaffLogin";
import StaffProfile from "./pages/StaffProfile";
import ShopStatistics from "./pages/ShopStatistics";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./pages/HomePage";
import { useEffect } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { shouldRedirect, getRedirectPath } from "@/lib/auth/routeProtection";

function App() {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, loading } = useCustomerAuth();

  useEffect(() => {
    if (loading) return;
    
    const currentPath = window.location.pathname;
    if (shouldRedirect(isAuthenticated, userRole, currentPath)) {
      const redirectPath = getRedirectPath(isAuthenticated, userRole, currentPath);
      navigate(redirectPath);
    }
  }, [isAuthenticated, userRole, navigate, loading]);

  return (
    <TooltipProvider>
      <Toaster position="top-right" closeButton richColors />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        
        {/* Customer Routes */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />}>
          <Route index element={<Navigate to="/customer-dashboard/appointments" replace />} />
          <Route path="appointments" element={<CustomerAppointments />} />
          <Route path="services" element={<CustomerServices />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
        
        {/* Staff Routes */}
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/services" element={<Services />} />
        <Route path="/staff-profile" element={<StaffProfile />} />
        <Route path="/shop-statistics" element={<ShopStatistics />} />
        
        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TooltipProvider>
  );
}

export default App;
