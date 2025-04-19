
import React, { useState, useEffect } from "react";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { StaffLayout } from "@/components/ui/staff-layout";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: null as ("erkek" | "kadın" | null),
    birthdate: "",
    avatarUrl: "",
    address: "",
    iban: "",
    role: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast.error("Kullanıcı bilgisi alınamadı");
        return;
      }

      // Set basic profile data from auth user
      setProfile(prev => ({
        ...prev,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone ? formatPhoneNumber(user.user_metadata.phone) : "",
        gender: user.user_metadata?.gender || null,
        birthdate: user.user_metadata?.birthdate || "",
        avatarUrl: user.user_metadata?.avatar_url || "",
        address: user.user_metadata?.address || "",
        iban: user.user_metadata?.iban || "",
        role: user.user_metadata?.role || ""
      }));

      // Try to get additional profile data from profiles table
      try {
        const profileData = await profilServisi.getir();
        
        if (profileData) {
          console.log("Retrieved profile data:", profileData);
          setProfile(prev => ({
            ...prev,
            firstName: profileData.first_name || prev.firstName,
            lastName: profileData.last_name || prev.lastName,
            phone: profileData.phone ? formatPhoneNumber(profileData.phone) : prev.phone,
            gender: profileData.gender as "erkek" | "kadın" | null || prev.gender,
            birthdate: profileData.birthdate || prev.birthdate,
            avatarUrl: profileData.avatar_url || prev.avatarUrl,
            address: profileData.address || prev.address,
            iban: profileData.iban || prev.iban
          }));
        }
      } catch (profileError) {
        console.error("Error fetching profile from table:", profileError);
        // Continue with the data from user metadata
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profil bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      setIsUploading(true);
      setProfile(prev => ({ ...prev, avatarUrl: url }));
      
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      
      await profilServisi.guncelle({
        avatar_url: url
      });
      
      toast.success("Profil fotoğrafı başarıyla güncellendi");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setProfile(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'gender') {
      setProfile(prev => ({ 
        ...prev, 
        [name]: value ? (value as "erkek" | "kadın") : null 
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const phoneForSaving = profile.phone.replace(/\s/g, '');
      
      console.log("Updating profile with data:", {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate,
        avatar_url: profile.avatarUrl,
        address: profile.address,
        iban: profile.iban
      });
      
      await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: phoneForSaving,
          gender: profile.gender,
          birthdate: profile.birthdate,
          avatar_url: profile.avatarUrl,
          address: profile.address,
          iban: profile.iban
        }
      });

      await profilServisi.guncelle({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate,
        avatar_url: profile.avatarUrl,
        address: profile.address,
        iban: profile.iban
      });
      
      toast.success("Profil bilgileriniz başarıyla güncellendi");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-64">
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ProfileDisplay {...profile} />
          <ProfileEditForm
            profile={profile}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleAvatarUpload={handleAvatarUpload}
            handleSave={handleSave}
            isSaving={isSaving}
            isUploading={isUploading}
          />
        </div>
      </div>
    </StaffLayout>
  );
};

export default Profile;
