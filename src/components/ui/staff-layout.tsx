
import React from "react";
import { StaffSidebar } from "./staff-sidebar";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      
      {/* Main content with padding and mobile spacing */}
      <main className="w-full md:ml-64 p-3 md:p-4 pt-16 md:pt-4">
        {children}
      </main>
    </div>
  );
}
