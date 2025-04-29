
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerProfile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfileManagement(user?.id);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSaveProfile = async (data) => {
    await updateProfile(data);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Müşteri Profili</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
              ) : (
                <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle>{profile?.first_name} {profile?.last_name}</CardTitle>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="appointments">Randevular</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="flex justify-end">
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Düzenle
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      İptal
                    </Button>
                    <Button form="profile-form" type="submit">
                      Kaydet
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <ProfileEditForm 
                  profile={profile}
                  onSubmit={handleSaveProfile}
                  onAvatarUpload={uploadAvatar}
                />
              ) : (
                <ProfileDisplay profile={profile} />
              )}
            </TabsContent>

            <TabsContent value="history">
              <p className="text-center text-muted-foreground py-8">
                İşlem geçmişi burada gösterilecektir.
              </p>
            </TabsContent>

            <TabsContent value="appointments">
              <p className="text-center text-muted-foreground py-8">
                Randevular burada gösterilecektir.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
