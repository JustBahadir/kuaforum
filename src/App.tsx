
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login"; 
import CustomerDashboard from "@/pages/CustomerDashboard";
import UnassignedStaff from "@/pages/UnassignedStaff";
import StaffJoinRequest from "@/pages/StaffJoinRequest";
import Profile from "@/pages/Profile";
import Personnel from "@/pages/Personnel"; 
import PendingStaffRequests from "@/pages/Personnel/PendingStaffRequests";
import AuthGoogleCallback from "@/pages/AuthGoogleCallback";
import Auth from "@/pages/Auth";
import ShopHome from "@/pages/ShopHome";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth-google-callback" element={<AuthGoogleCallback />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/shop-home" element={<ShopHome />} />
          <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
          <Route path="/unassigned-staff" element={<UnassignedStaff />} />
          <Route path="/staff-join-request" element={<StaffJoinRequest />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/personnel/pending-requests" element={<PendingStaffRequests />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
