import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ShopHome from "@/pages/ShopHome";
import StaffLoginPage from "@/pages/StaffLoginPage";
import CustomerDashboardPage from "@/pages/CustomerDashboardPage";
import UnassignedStaff from "@/pages/UnassignedStaff";
import StaffJoinRequest from "@/pages/StaffJoinRequest";
import ShopRegistrationPage from "@/pages/ShopRegistrationPage";
import StaffRegisterPage from "@/pages/StaffRegisterPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import NewAppointmentPage from "@/pages/NewAppointmentPage";
import AppointmentDetailsPage from "@/pages/AppointmentDetailsPage";
import CustomerListPage from "@/pages/CustomerListPage";
import NewCustomerPage from "@/pages/NewCustomerPage";
import CustomerDetailsPage from "@/pages/CustomerDetailsPage";
import Profile from "@/pages/Profile";
import CustomerProfilePage from "@/pages/CustomerProfilePage";
import OperationsPage from "@/pages/OperationsPage";
import PersonnelPage from "@/pages/Personnel/PersonnelPage";
import SettingsPage from "@/pages/SettingsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import PendingStaffRequests from "@/pages/Personnel/PendingStaffRequests";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/shop-home" element={<ShopHome />} />
        <Route path="/staff-login" element={<StaffLoginPage />} />
        <Route path="/customer-dashboard" element={<CustomerDashboardPage />} />
        <Route path="/unassigned-staff" element={<UnassignedStaff />} />
        <Route path="/staff-join-request" element={<StaffJoinRequest />} />
        <Route path="/shop-register" element={<ShopRegistrationPage />} />
        <Route path="/staff-register" element={<StaffRegisterPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/new" element={<NewAppointmentPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<NewCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/customer-profile" element={<CustomerProfilePage />} />
        <Route path="/operations/staff" element={<OperationsPage />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/personnel/pending-requests" element={<PendingStaffRequests />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
