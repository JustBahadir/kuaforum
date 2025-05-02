
import { useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { ProfileComponent } from "@/components/profile/ProfileComponent";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    saveUserData,
    loadUserAndStaffData,
    handleAvatarUpload,
    isUploading = false
  } = useUnassignedStaffData();

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  // Create handleSave function that wraps saveUserData
  const handleSave = async (updatedData: any) => {
    try {
      await saveUserData(updatedData);
      toast.success("Profil bilgileri kaydedildi");
    } catch (error) {
      console.error("Profil kaydetme hatası:", error);
      toast.error("Profil kaydedilemedi");
    }
  };

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
