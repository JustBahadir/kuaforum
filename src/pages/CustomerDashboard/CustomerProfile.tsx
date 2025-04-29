
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileDisplay } from '@/components/customer-profile/ProfileDisplay';
import { ProfileEditForm } from '@/components/customer-profile/ProfileEditForm';
import { User, Settings, History, Clock } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { supabase } from '@/lib/supabase/client';

export default function CustomerProfile() {
  const { userId } = useCustomerAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfileManagement(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
  }

  const handleSaveProfile = async (formData) => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (file) => {
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Profilim</h1>
        <p className="text-gray-600 mt-1">Profil bilgilerinizi görüntüleyin ve düzenleyin.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Sol Sidebar */}
        <div className="md:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 border-4 border-white mb-4">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-purple-200 text-purple-800 text-2xl">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-xl">{profile?.first_name} {profile?.last_name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TabsList className="flex flex-col w-full rounded-none">
                <TabsTrigger 
                  value="personal" 
                  className={`justify-start py-3 px-4 ${activeTab === 'personal' ? 'bg-muted' : ''}`}
                  onClick={() => setActiveTab('personal')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Kişisel Bilgiler
                </TabsTrigger>
                <TabsTrigger 
                  value="appointments" 
                  className={`justify-start py-3 px-4 ${activeTab === 'appointments' ? 'bg-muted' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Randevu Geçmişi
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className={`justify-start py-3 px-4 ${activeTab === 'history' ? 'bg-muted' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <History className="mr-2 h-4 w-4" />
                  İşlem Geçmişi
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className={`justify-start py-3 px-4 ${activeTab === 'settings' ? 'bg-muted' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Hesap Ayarları
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </div>

        {/* Sağ İçerik */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profil Bilgileri</CardTitle>
              {activeTab === 'personal' && !isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  Düzenle
                </Button>
              )}
              {activeTab === 'personal' && isEditing && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    form="profile-form"
                    type="submit"
                  >
                    Kaydet
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
                <TabsContent value="personal">
                  {isEditing ? (
                    <ProfileEditForm 
                      profile={profile} 
                      onSubmit={handleSaveProfile} 
                      onAvatarUpload={handleAvatarUpload}
                    />
                  ) : (
                    <ProfileDisplay profile={profile} />
                  )}
                </TabsContent>
                <TabsContent value="appointments">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Randevu geçmişi yakında burada görüntülenebilecek...</p>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>İşlem geçmişi yakında burada görüntülenebilecek...</p>
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Hesap ayarları yakında burada görüntülenebilecek...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
