
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import UnassignedStaffMain from "@/components/unassigned-staff/UnassignedStaffMain";

export default function UnassignedStaff() {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  
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

  // Load user data when page loads
  useEffect(() => {
    const initialLoad = async () => {
      await loadUserAndStaffData();
    };
    
    initialLoad();
  }, [loadUserAndStaffData]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Bilgileriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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

  // No data loaded yet
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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
      loading={loading}
      navigate={navigate}
    />
  );
}
