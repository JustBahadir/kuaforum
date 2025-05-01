
import { StaffLayout } from "@/components/ui/staff-layout";
import ProfileTabs from "./ProfileTabs";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useEffect, useState } from "react";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";

export default function Profile() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const getUserId = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
        toast.error("Kullanıcı bilgisi alınamadı");
      }
    };
    
    getUserId();
  }, []);

  const { 
    profileData, 
    loading,
    fetchProfileData,
    updateProfile,
    updateEducation,
    updateHistory,
    uploadAvatar,
    uploadCv
  } = useProfileManagement(userId);
  
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId, fetchProfileData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // This would typically update a form state
    console.log(`Field ${name} changed to ${value}`);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    // This would typically update a form state
    console.log(`Select ${name} changed to ${value}`);
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        <ProfileTabs 
          profile={profileData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleAvatarUpload={uploadAvatar}
          isLoading={loading}
          updateProfile={updateProfile}
          educationData={profileData?.education}
          updateEducation={updateEducation}
          historyData={profileData?.history}
          updateHistory={updateHistory}
          uploadCv={uploadCv}
        />
      </div>
    </StaffLayout>
  );
}
