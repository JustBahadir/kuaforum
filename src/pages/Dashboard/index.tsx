
import { useState } from "react";
import { TestDataButton } from "./components/TestDataButton";
import { MainMenuOptions } from "./components/MainMenuOptions";
import { CustomerMenu } from "./components/CustomerMenu";
import { PersonnelMenu } from "./components/PersonnelMenu";

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState<'none' | 'customer' | 'personnel'>('none');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Admin Test Button */}
        <TestDataButton />
        
        {/* Menu Selection Logic */}
        {selectedSection === 'none' && (
          <MainMenuOptions 
            onSelectCustomer={() => setSelectedSection('customer')}
            onSelectPersonnel={() => setSelectedSection('personnel')}
          />
        )}

        {/* Customer Menu */}
        {selectedSection === 'customer' && (
          <CustomerMenu onBackClick={() => setSelectedSection('none')} />
        )}

        {/* Personnel Menu */}
        {selectedSection === 'personnel' && (
          <PersonnelMenu onBackClick={() => setSelectedSection('none')} />
        )}
      </div>
    </div>
  );
}
