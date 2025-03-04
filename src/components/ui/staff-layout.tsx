
import React from "react";
import { StaffSidebar } from "./staff-sidebar";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      
      <main className="flex-1 md:ml-64 p-4">
        {children}
      </main>
    </div>
  );
}
