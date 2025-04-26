
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import UnassignedStaffMain from "@/components/unassigned-staff/UnassignedStaffMain";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 text-center w-full max-w-md">
          <h3 className="font-bold">Hata</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm text-gray-500">
            Eğer kayıt olurken personel emaili ile girdiyseniz, sistemde personel tablosunda kaydınız açılmadıysa bu hatayı alırsınız.<br/>
            Lütfen yöneticiye başvurun!
          </p>
        </div>
        <Button onClick={() => navigate("/login")}>Giriş Sayfasına Dön</Button>
      </div>
    );
  }

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
