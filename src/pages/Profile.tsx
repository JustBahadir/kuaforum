
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { ProfileComponent, EducationData, HistoryData } from "@/components/profile/ProfileComponent";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
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
  } = useUnassignedStaffData();

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  const handleAvatarUpload = async (file: File | string) => {
    try {
      setIsUploading(true);
      // Avatar upload logic would go here
      // For now, we'll just show a success toast
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      toast.success("Profil fotoğrafı başarıyla yüklendi", {
        position: "bottom-right"
      });
    } catch (error) {
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu", {
        position: "bottom-right"
      });
    } finally {
      setIsUploading(false);
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
