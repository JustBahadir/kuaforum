
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { SidebarNav } from "@/components/customer-dashboard/SidebarNav";
import { MobileNav } from "@/components/customer-dashboard/MobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerAppointments from "./CustomerDashboard/CustomerAppointments";
import CustomerProfile from "./CustomerDashboard/CustomerProfile";
import CustomerSettings from "./CustomerDashboard/CustomerSettings";
import { CustomerServices } from "./CustomerDashboard/CustomerServices";
import CustomerHome from "./CustomerDashboard/CustomerHome";

export default function CustomerDashboard() {
  const { userName, loading, activeTab, handleLogout } = useCustomerAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-sm text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <SidebarNav 
        activeTab={activeTab} 
        userName={userName} 
        onLogout={handleLogout} 
      />

      {/* Mobile Navigation */}
      <MobileNav 
        activeTab={activeTab}
        userName={userName}
        onLogout={handleLogout} 
      />
      
      {/* Main content - adjusted for both mobile top and bottom nav */}
      <div className="flex-1 md:p-8 p-4 pt-20 md:pt-8 pb-24 md:pb-8 md:ml-64">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/appointments" element={<CustomerAppointments />} />
          <Route path="/services" element={<CustomerServices />} />
          <Route path="/settings" element={<CustomerSettings />} />
          <Route path="*" element={<Navigate to="/customer-dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}
