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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
              <TabsTrigger value="history">Geçmiş Bilgileri</TabsTrigger>
              <TabsTrigger value="registration">Ön Kayıt</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <StaffPersonalInfoTab 
                profile={profileData || {}}
                onSave={async (data) => await updateProfile(data)}
                onAvatarUpload={async (file) => await uploadAvatar(file)}
              />
            </TabsContent>
            
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
            
            <TabsContent value="registration">
              <StaffPreRegistrationTab 
                educationData={profileData?.education || {
                  ortaokuldurumu: "",
                  lisedurumu: "",
                  liseturu: "",
                  meslekibrans: "",
                  universitedurumu: "",
                  universitebolum: ""
                }}
                historyData={profileData?.history || {
                  isyerleri: "",
                  gorevpozisyon: "",
                  belgeler: "",
                  yarismalar: "",
                  cv: ""
                }}
                onEducationChange={() => {}}
                onHistoryChange={() => {}}
                onSave={async () => {}}
                isLoading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
