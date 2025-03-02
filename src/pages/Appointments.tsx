import React from "react";
import { StaffLayout } from "@/components/ui/staff-layout";

export default function Appointments() {
  return (
    <StaffLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Randevular</h1>
        
        {/* Appointment content goes here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Randevu içeriği buraya gelecek</p>
        </div>
      </div>
    </StaffLayout>
  );
}
