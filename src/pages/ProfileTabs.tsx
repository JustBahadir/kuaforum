
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffPersonalInfoTab from "@/pages/Profile/StaffPersonalInfoTab";
import EducationTab from "@/pages/Profile/EducationTab";
import HistoryTab from "@/pages/Profile/HistoryTab";
import { toast } from "sonner";

interface ProfileTabsProps {
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
  handleAvatarUpload: (url: string) => Promise<void>;
  handleSave: () => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
  educationData: {
    ortaokuldurumu: string;
    lisedurumu: string;
    liseturu: string;
    meslekibrans: string;
    universitedurumu: string;
    universitebolum: string;
  };
  historyData: {
    isyerleri: string;
    gorevpozisyon: string;
    belgeler: string;
    yarismalar: string;
    cv: string;
  };
  onEducationChange: (data: any) => void;
  onHistoryChange: (data: any) => void;
  onSaveEducationHistory: () => Promise<void>;
  isLoadingEducationHistory: boolean;
}

const ProfileTabs = ({
  profile,
  handleChange,
  handleSelectChange,
  handleAvatarUpload,
  handleSave,
  isSaving,
  isUploading,
  educationData,
  historyData,
  onEducationChange,
  onHistoryChange,
  onSaveEducationHistory,
  isLoadingEducationHistory
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState("personal");

  // Handle saving education and history data
  const handleSaveEducationData = async (updatedEducationData: any) => {
    try {
      // Update local state
      onEducationChange(updatedEducationData);
      // Save to database
      await onSaveEducationHistory();
      return true;
    } catch (error) {
      console.error("Error saving education data:", error);
      toast.error("Eğitim bilgileri kaydedilirken bir hata oluştu");
      throw error;
    }
  };

  // Handle saving history data
  const handleSaveHistoryData = async (updatedHistoryData: any) => {
    try {
      // Update local state
      onHistoryChange(updatedHistoryData);
      // Save to database
      await onSaveEducationHistory();
      return true;
    } catch (error) {
      console.error("Error saving history data:", error);
      toast.error("Geçmiş bilgileri kaydedilirken bir hata oluştu");
      throw error;
    }
  };

  return (
    <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
        <TabsTrigger value="personal">Kişisel</TabsTrigger>
        <TabsTrigger value="education">Eğitim</TabsTrigger>
        <TabsTrigger value="history">Geçmiş</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal">
        <StaffPersonalInfoTab
          profile={profile}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleAvatarUpload={handleAvatarUpload}
          handleSave={handleSave}
          isSaving={isSaving}
          isUploading={isUploading}
        />
      </TabsContent>
      
      <TabsContent value="education">
        <EducationTab
          educationData={educationData}
          onEducationChange={onEducationChange}
          onSave={handleSaveEducationData}
          isLoading={isLoadingEducationHistory}
        />
      </TabsContent>
      
      <TabsContent value="history">
        <HistoryTab
          historyData={historyData}
          onHistoryChange={onHistoryChange}
          onSave={handleSaveHistoryData}
          isLoading={isLoadingEducationHistory}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
