
import React from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function Appointments() {
  const { userRole } = useCustomerAuth();
  
  return (
    <StaffLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Randevular</h1>
        
        {/* Appointment content goes here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Bu bölümde, {userRole === 'admin' ? 'tüm personelin' : 'kendinize ait'} randevuları yönetebilirsiniz.</p>
        </div>
      </div>
    </StaffLayout>
  );
}
