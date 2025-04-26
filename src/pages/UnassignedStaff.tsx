import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import UnassignedStaffMain from "@/components/unassigned-staff/UnassignedStaffMain";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function UnassignedStaff() {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    loading,
    error,
    userProfile,
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    handleLogout,
    handleSave,
    loadUserAndStaffData,
  } = useUnassignedStaffData();

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  const handleAvatarUpload = async (url: string) => {
    try {
      setIsUploading(true);
      
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });

      await loadUserAndStaffData();
      toast.success("Profil fotoğrafı başarıyla güncellendi");
    } catch (error) {
      console.error("Avatar yükleme hatası:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Bilgileriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Bir hata oluştu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadUserAndStaffData}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold mb-2">Profil bulunamadı</h2>
          <p className="text-gray-600 mb-4">Profil bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.</p>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <UnassignedStaffMain
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userProfile={userProfile}
      educationData={educationData}
      setEducationData={setEducationData}
      historyData={historyData}
      setHistoryData={setHistoryData}
      handleLogout={handleLogout}
      handleSave={handleSave}
      handleAvatarUpload={handleAvatarUpload}
      loading={loading}
      isUploading={isUploading}
      navigate={navigate}
    />
  );
}
