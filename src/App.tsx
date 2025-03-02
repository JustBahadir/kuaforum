
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/login" element={<Navigate to="/staff-login" />} />
          
          {/* Staff routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/personnel" element={<Personnel />} />
          
          {/* Customer routes */}
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
        </Routes>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
