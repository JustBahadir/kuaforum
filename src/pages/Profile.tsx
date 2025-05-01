
import { useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { ProfileComponent } from "@/components/profile/ProfileComponent";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const {
    loading,
    userProfile,
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    handleLogout,
    handleSave,
    loadUserAndStaffData,
    handleAvatarUpload, // We need to either use this or remove it
    isUploading = false // Default value if not available
  } = useUnassignedStaffData();

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  return (
    <StaffLayout>
      <ProfileComponent
        activeTab="personal"
        userProfile={userProfile || {}}
        loading={loading}
        handleLogout={handleLogout}
        handleSave={handleSave}
        handleAvatarUpload={handleAvatarUpload}
        isUploading={isUploading}
        educationData={educationData}
        historyData={historyData}
        setEducationData={setEducationData}
        setHistoryData={setHistoryData}
      />
    </StaffLayout>
  );
}
