
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Appointments from "./pages/Appointments";
import Dashboard from "./pages/Dashboard";
import CustomerProfile from "./pages/CustomerProfile";
import Personnel from "./pages/Personnel";
import StaffLogin from "./pages/StaffLogin";

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
        </Routes>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
