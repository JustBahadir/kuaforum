
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { profileServisi } from "@/lib/supabase/services/profileServisi";
import { uiStore } from "@/stores/uiStore";

export function useProfileManagement() {
  const { user } = useAuth();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    birthdate: "",
    iban: "",
    gender: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const {setIsProfileCompleted} = uiStore();

  const updateProfileField = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const loadProfileData = async () => {
    try {
      if (!user?.id) return;

      // Get profile data
      const profile = await profileServisi.getir(user.id);
      
      if (profile) {
        setProfileData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          birthdate: profile.birthdate ? new Date(profile.birthdate).toISOString().split('T')[0] : "",
          iban: profile.iban || "",
          gender: profile.gender || "",
        });
        
        setAvatarUrl(profile.avatar_url || null);
        
        // Check if profile is completed
        const isComplete = Boolean(profile.first_name && profile.phone);
        setIsProfileCompleted(isComplete);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Profil bilgileri yüklenemedi");
    }
  };

  const saveProfile = async () => {
    try {
      if (!user?.id) {
        throw new Error("Kullanıcı kimliği bulunamadı");
      }
      
      setIsSaving(true);
      
      // Fix: Use the profileServisi to update the profile
      await profileServisi.guncelle(user.id, {
        ...profileData,
        updated_at: new Date().toISOString(),
      });
      
      // Check if profile is completed
      const isComplete = Boolean(profileData.first_name && profileData.phone);
      setIsProfileCompleted(isComplete);
      
      toast.success("Profil bilgileri başarıyla güncellendi");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Profil kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!user?.id) {
        throw new Error("Kullanıcı kimliği bulunamadı");
      }
      
      setIsUploadingAvatar(true);
      
      // Upload file to storage
      const filePath = `avatars/${user.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      
      // Update profile with avatar URL
      await profileServisi.guncelle(user.id, {
        avatar_url: publicUrl,
      });
      
      setAvatarUrl(publicUrl);
      toast.success("Profil fotoğrafı güncellendi");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(`Profil fotoğrafı yüklenirken bir hata oluştu - ${error.message || "Bilinmeyen hata"}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return {
    profileData,
    updateProfileField,
    loadProfileData,
    saveProfile,
    isSaving,
    uploadAvatar,
    isUploadingAvatar,
    avatarUrl,
  };
}
