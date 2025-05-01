
import { StaffLayout } from "@/components/ui/staff-layout";
import ProfileTabs from "./ProfileTabs";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useEffect, useState } from "react";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

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
  }, [userId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // This would typically update a form state
    console.log(`Field ${name} changed to ${value}`);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    // This would typically update a form state
    console.log(`Select ${name} changed to ${value}`);
  };

  // Check if buckets exist or create them
  useEffect(() => {
    const setupStorage = async () => {
      try {
        // Create avatars bucket if it doesn't exist
        const { error: avatarError } = await supabase.storage
          .createBucket('avatars', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2 // 2MB
          });
          
        if (avatarError && avatarError.message !== "Bucket already exists") {
          console.error("Avatar bucket creation error:", avatarError);
        } else {
          console.log("Avatar bucket ready");
        }
        
        // Create documents bucket if it doesn't exist
        const { error: docsError } = await supabase.storage
          .createBucket('documents', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 10 // 10MB
          });
          
        if (docsError && docsError.message !== "Bucket already exists") {
          console.error("Documents bucket creation error:", docsError);
        } else {
          console.log("Documents bucket ready");
        }
      } catch (error) {
        console.error("Storage setup error:", error);
      }
    };
    
    setupStorage();
  }, []);

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
