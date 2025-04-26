
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
    isyerleri: string;
    gorevpozisyon: string;
    belgeler: string;
    yarismalar: string;
    cv: string;
  };
  onEducationChange: (data: ProfileTabsProps["educationData"]) => void;
  onHistoryChange: (data: ProfileTabsProps["historyData"]) => void;
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
  // Ana view: "personalInfo" veya "educationHistory"
  const [mainView, setMainView] = useState<"personalInfo" | "educationHistory">("personalInfo");

  // Alt sekme: sadece eğitim veya geçmiş gösterilecek
  const [subTab, setSubTab] = useState<"education" | "history">("education");

  // Create wrapper functions that properly adapt our functions to the component props
  const handleEducationDataChange = (data: typeof educationData) => {
    onEducationChange(data);
  };

  const handleHistoryDataChange = (data: typeof historyData) => {
    onHistoryChange(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Mevcut Bilgiler bölümü, sayfa doğal akışında, scrolla bağlı */}
      <div className="mb-6 bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <ProfileDisplay {...profile} />
      </div>

      {/* Ana butonlar */}
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
          onClick={() => {
            setMainView("educationHistory");
            setSubTab("education");
          }}
          type="button"
          aria-label="Eğitim ve Geçmiş"
        >
          Eğitim ve Geçmiş
        </button>
      </div>

      {/* İçerik alanı */}
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
            {/* Alt sekmeler */}
            <nav className="flex border-b border-gray-300 mb-4">
              <button
                onClick={() => setSubTab("education")}
                className={`flex-1 py-2 font-semibold text-center transition-colors duration-150 ${
                  subTab === "education"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-purple-600"
                }`}
                type="button"
                aria-label="Eğitim Bilgileri"
              >
                Eğitim Bilgileri
              </button>
              <button
                onClick={() => setSubTab("history")}
                className={`flex-1 py-2 font-semibold text-center transition-colors duration-150 ${
                  subTab === "history"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-purple-600"
                }`}
                type="button"
                aria-label="Geçmiş Bilgileri"
              >
                Geçmiş Bilgileri
              </button>
            </nav>

            {/* Alt sekme içerikleri */}
            {subTab === "education" && (
              <EducationTab
                educationData={educationData}
                onEducationChange={handleEducationDataChange}
                onSave={onSaveEducationHistory}
                isLoading={isLoadingEducationHistory}
              />
            )}

            {subTab === "history" && (
              <HistoryTab
                historyData={historyData}
                onHistoryChange={handleHistoryDataChange}
                onSave={onSaveEducationHistory}
                isLoading={isLoadingEducationHistory}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
