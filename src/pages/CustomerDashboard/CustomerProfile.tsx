import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function CustomerProfile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: null as ("erkek" | "kadın" | null),
    birthdate: "",
    avatarUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { refreshProfile } = useCustomerAuth();
  
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error getting user:", error);
          toast.error("Kullanıcı bilgisi alınamadı");
          setLoading(false);
          return;
        }
        
        if (!user) {
          toast.error("Kullanıcı bilgisi bulunamadı");
          setLoading(false);
          return;
        }
        
        setProfile(prev => ({ ...prev, email: user.email || "" }));
        
        if (user.user_metadata) {
          const metaFirstName = user.user_metadata.first_name;
          const metaLastName = user.user_metadata.last_name;
          const metaPhone = user.user_metadata.phone;
          const metaGender = user.user_metadata.gender as "erkek" | "kadın" | null;
          const metaBirthdate = user.user_metadata.birthdate;
          const metaAvatarUrl = user.user_metadata.avatar_url;
          
          if (metaFirstName || metaLastName || metaPhone || metaGender || metaBirthdate) {
            console.log("Using profile data from user metadata");
            let formattedPhone = metaPhone ? formatPhoneNumber(metaPhone) : "";
            
            setProfile({
              firstName: metaFirstName || "",
              lastName: metaLastName || "",
              phone: formattedPhone,
              email: user.email || "",
              gender: metaGender || null,
              birthdate: metaBirthdate || "",
              avatarUrl: metaAvatarUrl || ""
            });
            
            setLoading(false);
            return;
          }
        }
        
        try {
          const profileData = await profilServisi.getir();
            
          if (profileData) {
            let formattedPhone = profileData.phone ? formatPhoneNumber(profileData.phone) : "";
            
            setProfile({
              firstName: profileData.first_name || "",
              lastName: profileData.last_name || "",
              phone: formattedPhone,
              email: user.email || "",
              gender: profileData.gender || null,
              birthdate: profileData.birthdate || "",
              avatarUrl: profileData.avatar_url || ""
            });

            console.log("Loaded profile data:", profileData);
          } else {
            console.warn("No profile data found");
          }
        } catch (profileError) {
          console.error("Error getting profile from table:", profileError);
        }
      } catch (error) {
        console.error("Error in fetchProfileData:", error);
        toast.error("Profil bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileData();
  }, []);
  
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
      refreshProfile();
      
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Kullanıcı bilgisi alınamadı");
        return;
      }
      
      const phoneForSaving = profile.phone.replace(/\s/g, '');
      
      console.log("Updating profile with data:", {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate,
        avatar_url: profile.avatarUrl
      });
      
      await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: phoneForSaving,
          gender: profile.gender,
          birthdate: profile.birthdate,
          avatar_url: profile.avatarUrl
        }
      });
      
      const result = await profilServisi.guncelle({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate,
        avatar_url: profile.avatarUrl
      });
      
      if (result) {
        toast.success("Profil bilgileriniz başarıyla güncellendi");
        refreshProfile();
      } else {
        toast.success("Profil bilgileriniz kaydedildi");
        refreshProfile();
      }
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      
      if (error.original && (error.original.code === '42P17' || error.original.message?.includes('infinite recursion'))) {
        toast.success("Profil bilgileriniz kaydedildi, ancak bazı alanlar güncellenememiş olabilir");
        refreshProfile();
      } else {
        toast.error(`İşlem sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Profil bilgileri yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
        <p className="text-gray-600 mt-1">Kişisel bilgilerinizi güncelleyin</p>
      </div>
      
      <ProfileDisplay 
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={profile.email}
        phone={profile.phone}
        gender={profile.gender}
        birthdate={profile.birthdate}
        avatarUrl={profile.avatarUrl}
      />
      
      <ProfileEditForm
        profile={profile}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSave={handleSave}
        handleAvatarUpload={handleAvatarUpload}
        isSaving={isSaving}
        isUploading={isUploading}
      />
    </div>
  );
}
