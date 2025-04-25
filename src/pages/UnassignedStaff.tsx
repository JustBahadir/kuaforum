import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Briefcase, LogOut } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import { useNavigate } from "react-router-dom";
import { UnassignedStaffSidebar } from "@/components/unassigned-staff/UnassignedStaffSidebar";
import { UnassignedStaffMobileNav } from "@/components/unassigned-staff/UnassignedStaffMobileNav";

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
    loadUserAndStaffData
  } = useUnassignedStaffData();

  useEffect(() => {
    loadUserAndStaffData();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <h3 className="font-bold">Hata</h3>
          <p>{error}</p>
        </div>
        <Button variant="default" onClick={() => navigate("/login")}>
          Giriş Sayfasına Dön
        </Button>
      </div>
    );
  }

  const renderPersonalInfo = () => (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <TabsContent value="personal" className="mt-0">
              {renderPersonalInfo()}
            </TabsContent>
            <TabsContent value="education" className="mt-0">
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
                    <Button
                      onClick={handleSave}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-0">
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
                    <Button
                      onClick={handleSave}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
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
