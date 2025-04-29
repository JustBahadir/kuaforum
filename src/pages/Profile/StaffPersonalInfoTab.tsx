
import React from "react";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";

export interface StaffPersonalInfoTabProps {
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    gender?: "erkek" | "kadın" | null;
    birthdate?: string;
    avatarUrl?: string;
    iban?: string;
    address?: string;
    role?: string;
  };
  onSave: (data: any) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
  isSaving?: boolean;
  isUploading?: boolean;
}

const StaffPersonalInfoTab = ({
  profile,
  onSave,
  onAvatarUpload,
  handleChange: propHandleChange,
  handleSelectChange: propHandleSelectChange,
  isSaving = false,
  isUploading = false
}: StaffPersonalInfoTabProps) => {
  const handleChange = propHandleChange || ((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Default implementation
    console.log("Change event:", e.target.name, e.target.value);
  });

  const handleSelectChange = propHandleSelectChange || ((name: string, value: string) => {
    // Default implementation
    console.log("Select change:", name, value);
  });

  return (
    <ProfileEditForm
      profile={profile}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleAvatarUpload={onAvatarUpload}
      handleSave={onSave}
      isSaving={isSaving}
      isUploading={isUploading}
    />
  );
};

export default StaffPersonalInfoTab;
