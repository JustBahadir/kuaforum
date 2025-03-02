
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { format } from "date-fns";

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Get email from auth
        setProfile(prev => ({ ...prev, email: user.email || "" }));
        
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, gender, birthdate')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Profil bilgileri alınırken bir hata oluştu");
        } else if (data) {
          let formattedPhone = data.phone ? formatPhoneNumber(data.phone) : "";
          
          // Format birthdate if exists
          let formattedBirthdate = "";
          if (data.birthdate) {
            try {
              formattedBirthdate = data.birthdate;
            } catch (e) {
              console.error("Error formatting birthdate:", e);
            }
          }
          
          setProfile({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: formattedPhone,
            email: user.email || "",
            gender: data.gender || "",
            birthdate: formattedBirthdate
          });
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
      />
      
      <ProfileEditForm
        profile={profile}
        handleChange={handleChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
