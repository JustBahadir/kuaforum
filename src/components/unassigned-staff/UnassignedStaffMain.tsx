
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Briefcase } from "lucide-react";
import { UnassignedStaffSidebar } from "./UnassignedStaffSidebar";
import { UnassignedStaffMobileNav } from "./UnassignedStaffMobileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingButton } from "@/components/ui/loading-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnassignedStaffMain({
  activeTab,
  setActiveTab,
  userProfile,
  educationData,
  setEducationData,
  historyData,
  setHistoryData,
  handleLogout,
  handleSave,
  loading,
  navigate,
}) {
  // İçerik bileşenleri
  const renderPersonalInfo = () => (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          {/* Avatar ve profil alanı */}
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24">
              {userProfile?.avatar_url ? (
                <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
              ) : (
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                  {userProfile?.first_name?.[0] || 'P'}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-sm text-gray-500 mt-2">Profil fotoğrafı</p>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">Kişisel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Ad Soyad</span>
                <span className="font-medium">{userProfile?.first_name} {userProfile?.last_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">E-posta</span>
                <span className="font-medium">{userProfile?.email || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Telefon</span>
                <span className="font-medium">{userProfile?.phone || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Adres</span>
                <span className="font-medium">{userProfile?.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEducationInfo = () => (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Eğitim Bilgileri</h2>
        <div className="space-y-4">
          {["ortaokuldurumu", "lisedurumu", "liseturu", "meslekibrans", "universitedurumu", "universitebolum"].map(key => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {({
                  ortaokuldurumu: "Ortaokul Durumu",
                  lisedurumu: "Lise Durumu",
                  liseturu: "Lise Türü",
                  meslekibrans: "Mesleki Branş",
                  universitedurumu: "Üniversite Durumu",
                  universitebolum: "Üniversite Bölüm"
                } as Record<string, string>)[key]}
              </label>
              <input
                className="w-full p-2 border rounded-md"
                value={educationData[key]}
                onChange={e => setEducationData({ ...educationData, [key]: e.target.value })}
                placeholder={
                  ({
                    ortaokuldurumu: "Ör: Mezun, Devam Ediyor...",
                    lisedurumu: "Ör: Mezun, Devam Ediyor...",
                    liseturu: "Ör: Anadolu, Meslek Lisesi...",
                    meslekibrans: "Ör: Kuaförlük, Estetik...",
                    universitedurumu: "Ör: Mezun, Devam Ediyor...",
                    universitebolum: "Ör: İşletme, Güzellik Uzmanlığı..."
                  } as Record<string, string>)[key]
                }
              />
            </div>
          ))}
          <LoadingButton
            onClick={handleSave}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            loading={loading}
          >
            Bilgileri Kaydet
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );

  const renderHistoryInfo = () => (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Geçmiş Bilgileri</h2>
        <div className="space-y-4">
          {["isyerleri", "gorevpozisyon", "belgeler", "yarismalar", "cv"].map(key => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {({
                  isyerleri: "İşyerleri",
                  gorevpozisyon: "Görev Pozisyon",
                  belgeler: "Belgeler",
                  yarismalar: "Yarışmalar",
                  cv: "CV"
                } as Record<string, string>)[key]}
              </label>
              <textarea
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={historyData[key]}
                onChange={e => setHistoryData({ ...historyData, [key]: e.target.value })}
                placeholder={
                  ({
                    isyerleri: "Çalıştığınız işyerleri...",
                    gorevpozisyon: "Üstlendiğiniz görevler...",
                    belgeler: "Sahip olduğunuz belgeler...",
                    yarismalar: "Katıldığınız yarışmalar...",
                    cv: "Özgeçmişiniz..."
                  } as Record<string, string>)[key]
                }
              />
            </div>
          ))}
          <LoadingButton
            onClick={handleSave}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            loading={loading}
          >
            Bilgileri Kaydet
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );

  const renderActiveTabContent = () => {
    // Eğer sayfa yüklenmişse içeriği göster
    if (activeTab === "personal") return renderPersonalInfo();
    if (activeTab === "education") return renderEducationInfo();
    if (activeTab === "history") return renderHistoryInfo();
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16 md:mt-0">
      <UnassignedStaffMobileNav userProfile={userProfile} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex">
        <UnassignedStaffSidebar
          userProfile={userProfile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onJoinToShop={() => navigate("/staff-join-request")}
        />
        <div className="md:ml-64 w-full p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {renderActiveTabContent()}
            
            {/* Butonlar - mobil */}
            <div className="md:hidden p-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => navigate("/staff-join-request")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Briefcase size={18} className="mr-2" />
                  İşletmeye Katıl
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut size={18} className="mr-2" />
                  Oturumu Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
