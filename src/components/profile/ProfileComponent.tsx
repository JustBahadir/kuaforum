
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileComponentProps {
  activeTab?: string;
  userProfile: any;
  loading: boolean;
  handleLogout: () => void;
  handleSave: (data: any) => void;
  handleAvatarUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  educationData: any;
  historyData: any;
  setEducationData: React.Dispatch<React.SetStateAction<any>>;
  setHistoryData: React.Dispatch<React.SetStateAction<any>>;
}

export function ProfileComponent({
  activeTab = "personal",
  userProfile,
  loading,
  handleLogout,
  handleSave,
  handleAvatarUpload,
  isUploading,
  educationData,
  historyData,
  setEducationData,
  setHistoryData
}: ProfileComponentProps) {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleAvatarUpload(event.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {userProfile?.avatar_url ? (
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.ad_soyad || "Profile"} />
              ) : (
                <AvatarFallback>{userProfile?.ad_soyad?.charAt(0) || "P"}</AvatarFallback>
              )}
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userProfile?.ad_soyad || "Profil"}</h2>
            <p className="text-muted-foreground">{userProfile?.email || ""}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>Çıkış Yap</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="education">Eğitim</TabsTrigger>
              <TabsTrigger value="history">Geçmiş</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSave(userProfile);
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                      <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={userProfile?.ad_soyad || ""}
                        onChange={(e) => {
                          const updatedProfile = { ...userProfile, ad_soyad: e.target.value };
                          handleSave(updatedProfile);
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={userProfile?.email || ""}
                        onChange={(e) => {
                          const updatedProfile = { ...userProfile, email: e.target.value };
                          handleSave(updatedProfile);
                        }}
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="education">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSave({ education: educationData });
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ortaokuldurumu" className="block text-sm font-medium text-gray-700">Ortaokul Durumu</label>
                    <input
                      type="text"
                      id="ortaokuldurumu"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={educationData?.ortaokuldurumu || ""}
                      onChange={(e) => setEducationData({ ...educationData, ortaokuldurumu: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="lisedurumu" className="block text-sm font-medium text-gray-700">Lise Durumu</label>
                    <input
                      type="text"
                      id="lisedurumu"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={educationData?.lisedurumu || ""}
                      onChange={(e) => setEducationData({ ...educationData, lisedurumu: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>Kaydet</Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="history">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSave({ history: historyData });
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="isyerleri" className="block text-sm font-medium text-gray-700">İş Yerleri</label>
                    <textarea
                      id="isyerleri"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={historyData?.isyerleri || ""}
                      onChange={(e) => setHistoryData({ ...historyData, isyerleri: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="gorevpozisyon" className="block text-sm font-medium text-gray-700">Görev/Pozisyon</label>
                    <input
                      type="text"
                      id="gorevpozisyon"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={historyData?.gorevpozisyon || ""}
                      onChange={(e) => setHistoryData({ ...historyData, gorevpozisyon: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>Kaydet</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
