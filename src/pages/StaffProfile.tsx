
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaffLayout } from "@/components/ui/staff-layout";
import { ProfileEditForm } from "@/components/customer-profile/ProfileEditForm";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { authService } from "@/lib/auth/authService";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

export default function StaffProfile() {
  const { userName, refreshProfile } = useCustomerAuth();
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    birthdate: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Kullanıcı bilgilerini al
      const user = await authService.getCurrentUser();
      if (!user) {
        toast.error("Kullanıcı bilgileri alınamadı");
        return;
      }
      
      // Profili al
      const profile = await profilServisi.getir();
      
      setProfile({
        firstName: profile?.first_name || user?.user_metadata?.first_name || "",
        lastName: profile?.last_name || user?.user_metadata?.last_name || "",
        phone: profile?.phone || user?.user_metadata?.phone || "",
        email: user.email || "",
        gender: profile?.gender || user?.user_metadata?.gender || "",
        birthdate: profile?.birthdate || user?.user_metadata?.birthdate || ""
      });
      
    } catch (error) {
      console.error("Profil yüklenirken hata:", error);
      toast.error("Profil bilgileri yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Profil güncelleme
      await profilServisi.guncelle({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        gender: profile.gender,
        birthdate: profile.birthdate
      });
      
      // Profil bilgilerini yenile
      await refreshProfile();
      
      toast.success("Profil bilgileriniz başarıyla güncellendi");
    } catch (error) {
      console.error("Profil güncellenirken hata:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <StaffLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </div>
      </StaffLayout>
    );
  }
  
  return (
    <StaffLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profil Bilgilerim</h1>
          
          <ProfileEditForm 
            profile={profile}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </StaffLayout>
  );
}
