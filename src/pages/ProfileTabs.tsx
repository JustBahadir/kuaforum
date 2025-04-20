import React, { useState } from "react";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import StaffPersonalInfoTab from "@/pages/Profile/StaffPersonalInfoTab";
import EducationTab from "@/pages/Profile/EducationTab";
import HistoryTab from "@/pages/Profile/HistoryTab";

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
  handleAvatarUpload: (url: string) => void;
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
    isyerleri: Array<{ isyeri: string; pozisyon: string }>;
    gorevpozisyon: string;
    belgeler: Array<{ belgeadi: string }>;
    yarismalar: Array<{ yarismaadi: string }>;
    cv: string;
  };
  onEducationChange: (field: keyof ProfileTabsProps["educationData"], value: string) => void;
  onHistoryChange: (field: keyof ProfileTabsProps["historyData"], value: any) => void;
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
  isLoadingEducationHistory,
}: ProfileTabsProps) => {
  const [mainView, setMainView] = useState<"personalInfo" | "educationHistory">("personalInfo");
  const [subTab, setSubTab] = useState<"education" | "history">("education");

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <ProfileDisplay {...profile} />
      </div>

      <div className="mb-6 flex border border-gray-300 rounded-md overflow-hidden shadow-sm select-none">
        <button
          className={`flex-1 py-3 text-center font-semibold transition-colors duration-200 ${
            mainView === "personalInfo"
              ? "bg-purple-600 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setMainView("personalInfo")}
          type="button"
          aria-label="Kişisel Bilgiler"
        >
          Kişisel Bilgiler
        </button>
        <button
          className={`flex-1 py-3 text-center font-semibold transition-colors duration-200 ${
            mainView === "educationHistory"
              ? "bg-purple-600 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setMainView("educationHistory")}
          type="button"
          aria-label="Eğitim ve Geçmiş"
        >
          Eğitim ve Geçmiş
        </button>
      </div>

      <div>
        {mainView === "personalInfo" && (
          <StaffPersonalInfoTab
            profile={profile}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleAvatarUpload={handleAvatarUpload}
            handleSave={handleSave}
            isSaving={isSaving}
            isUploading={isUploading}
          />
        )}

        {mainView === "educationHistory" && (
          <div>
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Eğitim Bilgileri</h2>
            <EducationTab
              educationData={educationData}
              onEducationChange={onEducationChange}
              onSave={onSaveEducationHistory}
              isLoading={isLoadingEducationHistory}
            />
            <h2 className="text-lg font-semibold border-b pb-2 mt-10 mb-4">Geçmiş Bilgileri</h2>
            <HistoryTab
              historyData={historyData}
              onHistoryChange={onHistoryChange}
              onSave={onSaveEducationHistory}
              isLoading={isLoadingEducationHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
