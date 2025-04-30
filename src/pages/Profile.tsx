
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffPersonalInfoTab from '@/pages/Profile/StaffPersonalInfoTab';
import HistoryTab from '@/pages/Profile/HistoryTab';
import EducationTab from '@/pages/Profile/EducationTab';
import { StaffPreRegistrationTab } from '@/pages/Profile/StaffPreRegistrationTab';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [activeSubTab, setActiveSubTab] = useState('education');
  const { user } = useAuth();
  const { profileData, loading, updateProfile, uploadAvatar } = useProfileManagement(user?.id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSubTabChange = (value: string) => {
    setActiveSubTab(value);
  };

  // Wrapper for avatar upload to convert Promise<string> to Promise<void>
  const handleAvatarUpload = async (file: File): Promise<void> => {
    try {
      await uploadAvatar(file);
      return;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
        <p className="text-muted-foreground mt-1">Kişisel bilgilerinizi ve geçmiş bilgilerinizi görüntüleyebilir ve düzenleyebilirsiniz.</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Profil Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="personal" className="text-center py-3">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="education_history" className="text-center py-3">Eğitim ve Geçmiş</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <StaffPersonalInfoTab 
                profile={{
                  firstName: profileData?.firstName || "",
                  lastName: profileData?.lastName || "",
                  phone: profileData?.phone || "",
                  email: profileData?.email || "",
                  gender: profileData?.gender || null,
                  birthdate: profileData?.birthdate || "",
                  avatarUrl: profileData?.avatarUrl,
                  iban: profileData?.iban,
                  address: profileData?.address,
                  role: profileData?.role,
                }}
                onSave={async (data) => await updateProfile(data)}
                onAvatarUpload={handleAvatarUpload}
              />
            </TabsContent>
            
            <TabsContent value="education_history">
              <Tabs value={activeSubTab} onValueChange={handleSubTabChange} className="w-full">
                <TabsList className="inline-flex w-full border-b mb-6">
                  <TabsTrigger 
                    value="education" 
                    className="flex-1 text-center py-4 border-b-2 data-[state=active]:border-purple-600"
                  >
                    Eğitim Bilgileri
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex-1 text-center py-4 border-b-2 data-[state=active]:border-purple-600"
                  >
                    Geçmiş Bilgileri
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="education">
                  <EducationTab 
                    educationData={profileData?.education || {
                      ortaokuldurumu: "",
                      lisedurumu: "",
                      liseturu: "",
                      meslekibrans: "",
                      universitedurumu: "",
                      universitebolum: ""
                    }}
                    onEducationChange={() => {}}
                    onSave={async () => {}}
                    isLoading={loading}
                  />
                </TabsContent>
                
                <TabsContent value="history">
                  <HistoryTab 
                    historyData={profileData?.history || {
                      isyerleri: "",
                      gorevpozisyon: "",
                      belgeler: "",
                      yarismalar: "",
                      cv: ""
                    }}
                    onHistoryChange={() => {}}
                    onSave={async () => {}}
                    isLoading={loading}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
