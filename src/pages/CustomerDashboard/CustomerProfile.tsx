
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

export default function CustomerProfile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    birthdate: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Kullanıcı bilgisi bulunamadı");
          setLoading(false);
          return;
        }
        
        // Get email from auth
        setProfile(prev => ({ ...prev, email: user.email || "" }));
        
        // Get profile data
        const profileData = await profilServisi.getir();
          
        if (profileData) {
          let formattedPhone = profileData.phone ? formatPhoneNumber(profileData.phone) : "";
          
          setProfile({
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            phone: formattedPhone,
            email: user.email || "",
            gender: profileData.gender || "",
            birthdate: profileData.birthdate || ""
          });

          console.log("Loaded profile data:", profileData);
        } else {
          console.warn("No profile data found");
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
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Kullanıcı bilgisi bulunamadı");
        return;
      }
      
      // Format phone number for saving - remove spaces
      const phoneForSaving = profile.phone.replace(/\s/g, '');
      
      console.log("Updating profile with data:", {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate
      });
      
      // Use profile service to update profile
      const result = await profilServisi.guncelle({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate
      });
      
      if (result) {
        toast.success("Profil bilgileriniz başarıyla güncellendi");
      } else {
        toast.error("Profil bilgileri güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("İşlem sırasında bir hata oluştu");
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
      />
      
      <ProfileEditForm
        profile={profile}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
