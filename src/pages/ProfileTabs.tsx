
import React, { useState } from "react";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import StaffPersonalInfoTab from "@/pages/Profile/StaffPersonalInfoTab";
import StaffPreRegistrationTab from "@/pages/Profile/StaffPreRegistrationTab";

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
  onEducationChange: (field: keyof ProfileTabsProps["educationData"], value: string) => void;
  onHistoryChange: (field: keyof ProfileTabsProps["historyData"], value: string) => void;
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
  // State to control which main view is active: "personalInfo" or "educationHistory"
  const [mainView, setMainView] = useState<"personalInfo" | "educationHistory">("personalInfo");

  // For the right side's inner tabs ("Eğitim Bilgileri" and "Geçmiş Bilgileri")
  const [subTab, setSubTab] = useState<"education" | "history">("education");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mevcut Bilgiler (üstte sabit) */}
      <div className="mb-6 sticky top-4 bg-white z-20 rounded-md shadow-sm border border-gray-200 p-6">
        <ProfileDisplay {...profile} />
      </div>

      {/* Split button */}
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
          aria-label="Eğitim ve Geçmiş Bilgileri"
        >
          Eğitim ve Geçmiş
        </button>
      </div>

      {/* İçerik */}
      <div>
        {mainView === "personalInfo" && (
          /* Kişisel bilgiler işletmeci tipindeki gibi, düzenlenebilir */
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
            {/* Alt menüler */}
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

            {/* Alt içerik */}
            {subTab === "education" && (
              <div>
                <StaffPreRegistrationTab
                  educationData={educationData}
                  historyData={historyData}
                  onEducationChange={onEducationChange}
                  onHistoryChange={onHistoryChange}
                  onSave={onSaveEducationHistory}
                  isLoading={isLoadingEducationHistory}
                />
              </div>
            )}

            {subTab === "history" && (
              <div>
                <StaffPreRegistrationTab
                  educationData={educationData}
                  historyData={historyData}
                  onEducationChange={onEducationChange}
                  onHistoryChange={onHistoryChange}
                  onSave={onSaveEducationHistory}
                  isLoading={isLoadingEducationHistory}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;

