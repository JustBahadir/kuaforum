
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login"; 
import CustomerDashboard from "@/pages/CustomerDashboard";
import UnassignedStaff from "@/pages/UnassignedStaff";
import StaffJoinRequest from "@/pages/StaffJoinRequest";
import Profile from "@/pages/Profile";
import Personnel from "@/pages/Personnel/PersonnelPage";
import PendingStaffRequests from "@/pages/Personnel/PendingStaffRequests";
import AuthGoogleCallback from "@/pages/AuthGoogleCallback";
import Auth from "@/pages/Auth";
import { toast, Toaster } from "sonner";

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-google-callback" element={<AuthGoogleCallback />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
        <Route path="/unassigned-staff" element={<UnassignedStaff />} />
        <Route path="/staff-join-request" element={<StaffJoinRequest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/personnel/pending-requests" element={<PendingStaffRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
