
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { RouteProtection } from "@/components/auth/RouteProtection";
import HomePage from "./pages/HomePage";
import StaffLogin from "./pages/StaffLogin";
import StaffRegister from "./pages/StaffRegister";
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
import StaffProfile from "./pages/StaffProfile";
import NotFound from "./pages/NotFound";
import ShopStatistics from "./pages/ShopStatistics";
import Settings from "./pages/Settings";
import ShopSettings from "./pages/ShopSettings";
import OperationsHistory from "./pages/OperationsHistory";
import CustomerOperations from "./pages/operations/CustomerOperations";
import StaffOperations from "./pages/operations/StaffOperations";
import { ThemeProvider } from "./components/ui/theme-provider";

// Create the query client with base configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Disable automatic refetching when window regains focus
    },
  },
});

function App() {
  // Check if we're in a standalone window/preview
  const isPreviewMode = window.location.href.includes('preview-');
  
  // Determine the correct basename based on preview mode
  const basename = isPreviewMode ? "/preview-kuaforum" : "/";

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basename}>
          <RouteProtection>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<HomePage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<CustomerAuth />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/admin" element={<StaffLogin />} />
              <Route path="/admin/register" element={<StaffRegister />} />
              
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
              <Route path="/staff-profile" element={<StaffProfile />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Admin Operations Routes */}
              <Route path="/admin/operations" element={<StaffOperations />} />
              <Route path="/admin/customers/new" element={<Customers />} />
              
              {/* Public Routes */}
              <Route path="/services" element={<CustomerOperations />} />
              <Route path="/appointments" element={<Appointments />} />
              
              {/* Handle unknown routes with NotFound */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteProtection>
          {!isPreviewMode && <ReactQueryDevtools />}
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
