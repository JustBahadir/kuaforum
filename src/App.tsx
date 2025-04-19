import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { RouteProtection } from "@/components/auth/RouteProtection";
import { ThemeProvider } from "@/components/ui/theme-provider";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import StaffProfile from "./pages/StaffProfile";
import CustomerAuth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateShop from "./pages/CreateShop";
import Services from "./pages/Services";
import Personnel from "./pages/Personnel";
import Appointments from "./pages/Appointments";
import CustomerDashboard from "./pages/CustomerDashboard";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import ShopHomePage from "./pages/ShopHomePage";
import NotFound from "./pages/NotFound";
import ShopStatistics from "./pages/ShopStatistics";
import Settings from "./pages/Settings";
import ShopSettings from "./pages/ShopSettings";
import OperationsHistory from "./pages/OperationsHistory";
import CustomerOperations from "./pages/operations/CustomerOperations";
import StaffOperations from "./pages/operations/StaffOperations";
import Profile from "./pages/Profile";
import StaffRegister from "./pages/StaffRegister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Set up any global listeners or config here
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RouteProtection>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<HomePage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<CustomerAuth />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/staff-register" element={<StaffRegister />} />
              
              {/* Customer Routes */}
              <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
              <Route path="/customer-profile" element={<CustomerProfile />} />
              <Route path="/customer-services" element={<CustomerOperations />} />
              <Route path="/customer-appointments" element={<Appointments />} />
              
              {/* Shop/Staff Routes */}
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/shop-home" element={<ShopHomePage />} />
              <Route path="/shop-settings" element={<ShopSettings />} />
              <Route path="/shop-statistics" element={<ShopStatistics />} />
              <Route path="/operations-history" element={<OperationsHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/staff-profile" element={<StaffProfile />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Admin Operations Routes */}
              <Route path="/admin/operations" element={<StaffOperations />} />
              <Route path="/admin/customers/new" element={<Customers />} />
              
              {/* Public Routes */}
              <Route path="/services" element={<CustomerOperations />} />
              <Route path="/appointments" element={<Appointments />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteProtection>
        </BrowserRouter>
        <ReactQueryDevtools />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
