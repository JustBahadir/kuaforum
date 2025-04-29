
import React from "react";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";

export interface StaffPersonalInfoTabProps {
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    gender: "erkek" | "kadın" | null;
    birthdate: string;
    avatarUrl?: string;
    iban?: string;
    address?: string;
    role?: string;
  };
  onSave: (data: any) => Promise<void>;
  onAvatarUpload: (url: string) => Promise<void>;
}

const StaffPersonalInfoTab = ({
  profile,
  onSave,
  onAvatarUpload
}: StaffPersonalInfoTabProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Handle input changes
  };

  const handleSelectChange = (name: string, value: string) => {
    // Handle select changes
  };

  return (
    <ProfileEditForm
      profile={profile}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleAvatarUpload={onAvatarUpload}
      handleSave={onSave}
      isSaving={false}
      isUploading={false}
    />
  );
};

export default StaffPersonalInfoTab;
