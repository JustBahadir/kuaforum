
import { StaffLayout } from "@/components/ui/staff-layout";
import { MainMenuOptions } from "./components/MainMenuOptions";
import { CustomerMenu } from "./components/CustomerMenu";
import { PersonnelMenu } from "./components/PersonnelMenu";
import { TestDataButton } from "./components/TestDataButton";

export default function DashboardPage() {
  // Handler for back clicks in menus
  const handleBackClick = () => {
    // This function will be called when the back button is clicked
    console.log("Back button clicked");
  };

  return (
    <StaffLayout>
      <div className="space-y-8">
        <MainMenuOptions />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <CustomerMenu onBackClick={handleBackClick} />
          <PersonnelMenu onBackClick={handleBackClick} />
        </div>
        
        <TestDataButton />
      </div>
    </StaffLayout>
  );
}
