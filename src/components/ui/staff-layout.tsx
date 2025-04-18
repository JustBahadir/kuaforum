
import { ReactNode } from "react";
import { StaffSidebar } from "@/components/ui/staff-sidebar";

interface StaffLayoutProps {
  children: ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Staff sidebar navigation */}
      <StaffSidebar />
      
      {/* Main content area */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
