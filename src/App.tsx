
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { RouteProtection } from "@/components/auth/RouteProtection";

// Import pages
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import StaffLogin from "@/pages/StaffLogin";
import StaffRegister from "@/pages/StaffRegister";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Personnel from "@/pages/Personnel";
import StaffProfile from "@/pages/StaffProfile";
import ShopJoinRequests from "@/pages/ShopJoinRequests";
import CustomerDashboard from "@/pages/CustomerDashboard";
import Appointments from "@/pages/admin/Appointments";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router>
          <RouteProtection>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/staff-register" element={<StaffRegister />} />
              <Route path="/staff-profile" element={<StaffProfile />} />
              <Route path="/shop-requests" element={<ShopJoinRequests />} />
              
              {/* Admin / Staff Routes */}
              <Route path="/shop-home" element={<Dashboard />} />
              <Route path="/shop-personnel" element={<Personnel />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/personnel" element={<Personnel />} />
              <Route path="/admin/appointments" element={<Appointments />} />
              
              {/* Customer Routes */}
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            </Routes>
          </RouteProtection>
        </Router>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
