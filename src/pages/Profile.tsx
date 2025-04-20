
// Add a right sidebar menu with two tabs in the staff Profile page,
// conditionally rendering tab content. Only for staff role.

import React, { useState, useEffect } from "react";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { StaffLayout } from "@/components/ui/staff-layout";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import StaffPersonalInfoTab from "@/pages/Profile/StaffPersonalInfoTab";
import StaffPreRegistrationTab from "@/pages/Profile/StaffPreRegistrationTab";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: null as ("erkek" | "kadın" | null),
    birthdate: "",
    avatarUrl: "",
    address: "",
    iban: "",
    role: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New state for sidebar tab selection: "personalInfo" | "preRegistration"
  const [activeTab, setActiveTab] = useState<"personalInfo" | "preRegistration">("personalInfo");

  // Education and history states for Pre-registration tab
  const [educationData, setEducationData] = useState({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    meslekibrans: "",
    universitedurumu: "",
    universitebolum: ""
  });
  const [historyData, setHistoryData] = useState({
    isyerleri: "",
    gorevpozisyon: "",
    belgeler: "",
    yarismalar: "",
    cv: ""
  });
  const [loadingEduHist, setLoadingEduHist] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch staff profile and education/history data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("Kullanıcı bilgisi alınamadı");
        return;
      }

      setProfile(prev => ({
        ...prev,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone ? formatPhoneNumber(user.user_metadata.phone) : "",
        gender: user.user_metadata?.gender || null,
        birthdate: user.user_metadata?.birthdate || "",
        avatarUrl: user.user_metadata?.avatar_url || "",
        address: user.user_metadata?.address || "",
        iban: user.user_metadata?.iban || "",
        role: user.user_metadata?.role || ""
      }));

      try {
        // Fetch profile table data to override if exists
        const profileData = await profilServisi.getir();

        if (profileData) {
          setProfile(prev => ({
            ...prev,
            firstName: profileData.first_name || prev.firstName,
            lastName: profileData.last_name || prev.lastName,
            phone: profileData.phone ? formatPhoneNumber(profileData.phone) : prev.phone,
            gender: profileData.gender as "erkek" | "kadın" | null || prev.gender,
            birthdate: profileData.birthdate || prev.birthdate,
            avatarUrl: profileData.avatar_url || prev.avatarUrl,
            address: profileData.address || prev.address,
            iban: profileData.iban || prev.iban
          }));
        }
      } catch {
        // Ignore if fetch fails
      }

      // Fetch education and history data for staff
      setLoadingEduHist(true);
      try {
        if (!user.id) {
          setLoadingEduHist(false);
          return;
        }

        const { data: eduData, error: eduError } = await supabase
          .from("staff_education")
          .select("*")
          .eq("personel_id", user.id)
          .single();

        if (!eduError && eduData) {
          setEducationData({
            ortaokuldurumu: eduData.ortaokuldurumu || "",
            lisedurumu: eduData.lisedurumu || "",
            liseturu: eduData.liseturu || "",
            meslekibrans: eduData.meslekibrans || "",
            universitedurumu: eduData.universitedurumu || "",
            universitebolum: eduData.universitebolum || ""
          });
        }

        const { data: histData, error: histError } = await supabase
          .from("staff_history")
          .select("*")
          .eq("personel_id", user.id)
          .single();

        if (!histError && histData) {
          setHistoryData({
            isyerleri: histData.isyerleri || "",
            gorevpozisyon: histData.gorevpozisyon || "",
            belgeler: histData.belgeler || "",
            yarismalar: histData.yarismalar || "",
            cv: histData.cv || ""
          });
        }
      } catch (error) {
        console.error("Staff education/history fetch error:", error);
      } finally {
        setLoadingEduHist(false);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profil bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Handlers (same as original)
  const handleAvatarUpload = async (url: string) => {
    try {
      setIsUploading(true);
      setProfile(prev => ({ ...prev, avatarUrl: url }));

      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });

      await profilServisi.guncelle({
        avatar_url: url
      });

      toast.success("Profil fotoğrafı başarıyla güncellendi");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setProfile(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "gender") {
      setProfile(prev => ({
        ...prev,
        [name]: value ? (value as "erkek" | "kadın") : null
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const phoneForSaving = profile.phone.replace(/\s/g, "");

      await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: phoneForSaving,
          gender: profile.gender,
          birthdate: profile.birthdate,
          avatar_url: profile.avatarUrl,
          address: profile.address,
          iban: profile.iban
        }
      });

      await profilServisi.guncelle({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate,
        avatar_url: profile.avatarUrl,
        address: profile.address,
        iban: profile.iban
      });

      toast.success("Profil bilgileriniz başarıyla güncellendi");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for education/history update: passed down to PreRegistration tab component
  const handleEducationChange = (field: keyof typeof educationData, value: string) => {
    setEducationData(prev => ({ ...prev, [field]: value }));
  };
  const handleHistoryChange = (field: keyof typeof historyData, value: string) => {
    setHistoryData(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveEducationHistory = async () => {
    setLoadingEduHist(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast.error("Kullanıcı bilgisi alınamadı");
        setLoadingEduHist(false);
        return;
      }

      const upsertEducation = supabase
        .from("staff_education")
        .upsert({
          personel_id: user.id,
          ...educationData,
          updated_at: new Date().toISOString()
        }, { onConflict: "personel_id" });

      const upsertHistory = supabase
        .from("staff_history")
        .upsert({
          personel_id: user.id,
          ...historyData,
          updated_at: new Date().toISOString()
        }, { onConflict: "personel_id" });

      const [eduResult, histResult] = await Promise.all([upsertEducation, upsertHistory]);
      const [eduData, eduError] = eduResult;
      const [histData, histError] = histResult;

      if (eduError || histError) {
        console.error("Error saving education/history:", eduError || histError);
        toast.error("Eğitim ve geçmiş bilgileri kaydedilemedi");
      } else {
        toast.success("Eğitim ve geçmiş bilgileri başarıyla kaydedildi");
      }
    } catch (error) {
      console.error("Error saving education/history:", error);
      toast.error("Eğitim ve geçmiş bilgileri kaydedilirken hata oluştu");
    } finally {
      setLoadingEduHist(false);
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-64 w-full">
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      </StaffLayout>
    );
  }

  const isStaff = profile.role === "staff";

  // Layout with right sidebar only for staff role
  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-6">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            <ProfileDisplay {...profile} />
            {/* No editing here - editing moved to tabs */}
          </div>

          {/* Right Sidebar Menu for Staff */}
          {isStaff && (
            <div className="w-full md:w-96 flex flex-col bg-white rounded-md shadow-md border overflow-hidden">
              <nav className="flex flex-col border-b">
                <button
                  onClick={() => setActiveTab("personalInfo")}
                  className={`px-6 py-3 font-semibold text-left border-b-2 transition-colors duration-200 ${
                    activeTab === "personalInfo" ? "border-purple-700 text-purple-700 bg-purple-50" : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  Özlük Bilgileri
                </button>
                <button
                  onClick={() => setActiveTab("preRegistration")}
                  className={`px-6 py-3 font-semibold text-left border-b-2 transition-colors duration-200 ${
                    activeTab === "preRegistration" ? "border-purple-700 text-purple-700 bg-purple-50" : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  Eğitim ve Geçmiş
                </button>
              </nav>

              <div className="p-6 overflow-y-auto flex-grow min-h-[400px]">
                {activeTab === "personalInfo" && (
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
                {activeTab === "preRegistration" && (
                  <StaffPreRegistrationTab
                    educationData={educationData}
                    historyData={historyData}
                    onEducationChange={handleEducationChange}
                    onHistoryChange={handleHistoryChange}
                    onSave={handleSaveEducationHistory}
                    isLoading={loadingEduHist}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default Profile;

