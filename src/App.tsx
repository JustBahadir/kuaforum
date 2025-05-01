
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { RouteProtection } from "@/components/auth/RouteProtection";
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
import AuthGoogleCallback from "./pages/AuthGoogleCallback";
import UnassignedStaff from "./pages/UnassignedStaff";
import StaffJoinRequest from "./pages/StaffJoinRequest";
import PendingStaffRequests from "./pages/Personnel/PendingStaffRequests";

function App() {
  return (
    <RouteProtection>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<CustomerAuth />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/auth-google-callback" element={<AuthGoogleCallback />} />

        {/* Shop/Staff Routes */}
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/personnel/pending-requests" element={<PendingStaffRequests />} />
        <Route path="/shop-home" element={<ShopHomePage />} />
        <Route path="/shop-settings" element={<ShopSettings />} />
        <Route path="/shop-statistics" element={<ShopStatistics />} />
        <Route path="/operations-history" element={<OperationsHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/staff-profile" element={<StaffProfile />} />
        <Route path="/unassigned-staff" element={<UnassignedStaff />} />
        <Route path="/staff-join-request" element={<StaffJoinRequest />} />
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
      <ReactQueryDevtools />
      <Toaster />
    </RouteProtection>
  );
}

export default App;
