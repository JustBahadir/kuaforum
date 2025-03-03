
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Appointments from "./pages/Appointments";
import Dashboard from "./pages/Dashboard";
import CustomerProfile from "./pages/CustomerProfile";
import Personnel from "./pages/Personnel";
import StaffLogin from "./pages/StaffLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import Services from "./pages/Services";
import Customers from "./pages/Customers";
import { useCustomerAuth } from "./hooks/useCustomerAuth";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, userRole, loading } = useCustomerAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/login" element={<Navigate to="/staff-login" />} />
      
      {/* Staff and Admin routes */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated && (userRole === 'staff' || userRole === 'admin') ? <Dashboard /> : <Navigate to="/staff-login" />} 
      />
      <Route 
        path="/appointments" 
        element={isAuthenticated && (userRole === 'staff' || userRole === 'admin') ? <Appointments /> : <Navigate to="/staff-login" />} 
      />
      <Route 
        path="/personnel" 
        element={isAuthenticated ? <Personnel /> : <Navigate to="/staff-login" />} 
      />
      <Route 
        path="/services" 
        element={isAuthenticated && (userRole === 'staff' || userRole === 'admin') ? <Services /> : <Navigate to="/staff-login" />} 
      />
      <Route 
        path="/customers" 
        element={isAuthenticated && (userRole === 'staff' || userRole === 'admin') ? <Customers /> : <Navigate to="/staff-login" />} 
      />
      
      {/* Customer routes */}
      <Route 
        path="/customer-profile" 
        element={isAuthenticated && userRole === 'customer' ? <CustomerProfile /> : <Navigate to="/staff-login" />} 
      />
      <Route 
        path="/customer-dashboard/*" 
        element={isAuthenticated && userRole === 'customer' ? <CustomerDashboard /> : <Navigate to="/staff-login" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppRoutes />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
