
import { StaffLayout } from "@/components/ui/staff-layout";
import { MainMenuOptions } from "./components/MainMenuOptions";
import { CustomerMenu } from "./components/CustomerMenu";
import { PersonnelMenu } from "./components/PersonnelMenu";
import { TestDataButton } from "./components/TestDataButton";

export default function DashboardPage() {
  return (
    <StaffLayout>
      <div className="space-y-8">
        <MainMenuOptions />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <CustomerMenu />
          <PersonnelMenu />
        </div>
        
        <TestDataButton />
      </div>
    </StaffLayout>
  );
}
