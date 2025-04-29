
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch customer profile from your backend
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id || user?.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Profil bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user?.id]);

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id || user?.id);

      if (error) throw error;
      setProfile(prev => ({ ...prev, ...data }));
      toast.success('Profil başarıyla güncellendi');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      const userId = id || user?.id;
      if (!userId) throw new Error('User ID not found');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({ avatar_url: data.publicUrl });
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Profil resmi yüklenirken bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSaveProfile = async (data: any) => {
    await updateProfile(data);
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
                  profile={profile || {}}
                  handleChange={() => {}}
                  handleSelectChange={() => {}}
                  handleAvatarUpload={uploadAvatar}
                  handleSave={handleSaveProfile}
                  isSaving={loading}
                  isUploading={loading}
                />
              ) : (
                <ProfileDisplay profile={profile || {}} />
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
