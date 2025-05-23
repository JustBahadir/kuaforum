
import React from "react";
import { UnassignedStaffSidebar } from "./UnassignedStaffSidebar";
import { UnassignedStaffMobileNav } from "./UnassignedStaffMobileNav";
import { PersonalInfoTab } from "./PersonalInfoTab";
import { StaffPreRegistrationTab } from "@/pages/Profile/StaffPreRegistrationTab";

export default function UnassignedStaffMain({
  activeTab,
  setActiveTab,
  userProfile,
  educationData,
  setEducationData,
  historyData,
  setHistoryData,
  handleLogout,
  handleSave,
  handleAvatarUpload,
  loading,
  isUploading,
  navigate,
  personelId,
}) {
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <PersonalInfoTab
            userProfile={userProfile}
            onSave={handleSave}
            isLoading={loading}
            onAvatarUpload={handleAvatarUpload}
            isUploading={isUploading}
          />
        );
      case "education":
        return (
          <StaffPreRegistrationTab
            educationData={educationData}
            historyData={historyData}
            onEducationChange={(field, value) => 
              setEducationData(prev => ({ ...prev, [field]: value }))
            }
            onHistoryChange={(field, value) => 
              setHistoryData(prev => ({ ...prev, [field]: value }))
            }
            onSave={handleSave}
            isLoading={loading}
          />
        );
      case "history":
        return (
          <StaffPreRegistrationTab
            educationData={educationData}
            historyData={historyData}
            onEducationChange={(field, value) => 
              setEducationData(prev => ({ ...prev, [field]: value }))
            }
            onHistoryChange={(field, value) => 
              setHistoryData(prev => ({ ...prev, [field]: value }))
            }
            onSave={handleSave}
            isLoading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white mt-16 md:mt-0">
      <UnassignedStaffMobileNav 
        userProfile={userProfile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      <div className="flex">
        <UnassignedStaffSidebar
          userProfile={userProfile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onJoinToShop={() => navigate("/staff-join-request")}
          personelId={personelId}
        />
        <div className="md:ml-64 w-full p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
