
import React, { useState } from "react";
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
  const [formData, setFormData] = useState({...profile});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (propHandleChange) {
      propHandleChange(e);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (propHandleSelectChange) {
      propHandleSelectChange(name, value);
    }
  };

  return (
    <ProfileEditForm
      profile={formData}
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
