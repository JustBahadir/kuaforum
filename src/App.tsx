
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouteProtectionProvider } from "./lib/auth/routeProtection";
import { Toaster } from "@/components/ui/sonner";
import { StaffLogin } from "./pages/StaffLogin";
import { StaffRegister } from "./pages/StaffRegister";
import { CustomerAuth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { CreateShop } from "./pages/CreateShop";
import { Services } from "./pages/Services";
import { Personnel } from "./pages/Personnel";
import { Appointments } from "./pages/Appointments";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { Customers } from "./pages/Customers";
import { CustomerProfile } from "./pages/CustomerProfile";
import { ShopHomePage } from "./pages/ShopHomePage";
import { StaffProfile } from "./pages/StaffProfile";
import { NotFound } from "./pages/NotFound";
import { ShopStatistics } from "./pages/ShopStatistics";
import { Settings } from "./pages/Settings";
import { ShopSettings } from "./pages/ShopSettings";
import { OperationsHistory } from "./pages/OperationsHistory";
import { CustomerOperations } from "./pages/operations/CustomerOperations";
import { StaffOperations } from "./pages/operations/StaffOperations";
import { ThemeProvider } from "./components/ui/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RouteProtectionProvider>
            <Routes>
              {/* Staff routes */}
              <Route path="/admin" element={<StaffLogin />} />
              <Route path="/admin/register" element={<StaffRegister />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/shop" element={<ShopHomePage />} />
              <Route path="/admin/services" element={<Services />} />
              <Route path="/admin/personnel" element={<Personnel />} />
              <Route path="/admin/appointments" element={<Appointments />} />
              <Route path="/admin/customers" element={<Customers />} />
              <Route path="/admin/profile" element={<StaffProfile />} />
              <Route path="/admin/create-shop" element={<CreateShop />} />
              <Route path="/admin/statistics" element={<ShopStatistics />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/shop-settings" element={<ShopSettings />} />
              <Route path="/admin/operations-history" element={<OperationsHistory />} />
              <Route path="/admin/operations" element={<StaffOperations />} />

              {/* Customer routes */}
              <Route path="/login" element={<CustomerAuth />} />
              <Route path="/account" element={<CustomerDashboard />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/services" element={<CustomerOperations />} />
              <Route path="/" element={<CustomerOperations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteProtectionProvider>
        </BrowserRouter>
        <ReactQueryDevtools />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
