
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
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleAvatarUpload: (url: string) => void;
  handleSave: () => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
}

const StaffPersonalInfoTab = ({
  profile,
  handleChange,
  handleSelectChange,
  handleAvatarUpload,
  handleSave,
  isSaving,
  isUploading
}: StaffPersonalInfoTabProps) => {
  return (
    <ProfileEditForm
      profile={profile}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleAvatarUpload={handleAvatarUpload}
      handleSave={handleSave}
      isSaving={isSaving}
      isUploading={isUploading}
    />
  );
};

export default StaffPersonalInfoTab;
