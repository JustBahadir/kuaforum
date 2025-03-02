
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/login" element={<Navigate to="/staff-login" />} />
          
          {/* Customer dashboard routes */}
          <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
        </Routes>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
