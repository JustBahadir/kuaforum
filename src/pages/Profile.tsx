
import { StaffLayout } from "@/components/ui/staff-layout";
import ProfileTabs from "./ProfileTabs";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useEffect, useState } from "react";
import { authService } from "@/lib/auth/authService";

export default function Profile() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const getUserId = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    getUserId();
  }, []);

  const { 
    profileData, 
    loading,
    updateProfile,
    uploadAvatar
  } = useProfileManagement(userId);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // This would typically update a form state
    console.log(`Field ${name} changed to ${value}`);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    // This would typically update a form state
    console.log(`Select ${name} changed to ${value}`);
  };
  
  const handleAvatarUpload = async (file: File) => {
    if (uploadAvatar) {
      await uploadAvatar(file);
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        <ProfileTabs 
          profile={profileData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleAvatarUpload={handleAvatarUpload}
          isLoading={loading}
          updateProfile={updateProfile}
          educationData={profileData?.education}
          historyData={profileData?.history}
        />
      </div>
    </StaffLayout>
  );
}
