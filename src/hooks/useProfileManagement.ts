
import { useState, useEffect } from "react";
import { profileService } from "@/lib/auth/profileService";
import { isletmeServisi } from "@/lib/supabase/services/dukkanServisi";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { supabase } from "@/lib/supabase/client";

type ProfileData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: "erkek" | "kadın" | null;
  birthdate?: string;
  avatarUrl?: string;
  iban?: string;
  address?: string;
  role?: string;
  education?: {
    ortaokuldurumu: string;
    lisedurumu: string;
    liseturu: string;
    meslekibrans: string;
    universitedurumu: string;
    universitebolum: string;
  };
  history?: {
    isyerleri: string;
    gorevpozisyon: string;
    belgeler: string;
    yarismalar: string;
    cv: string;
  };
};

/**
 * Hook for managing user profile information
 */
export function useProfileManagement(userId?: string) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [dukkanAdi, setDukkanAdi] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await profilServisi.getir(userId);
        
        // Fetch education and history data
        const { data: educationData } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', userId)
          .single();
          
        const { data: historyData } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', userId)
          .single();

        setProfileData({
          ...profile,
          education: educationData || {
            ortaokuldurumu: "",
            lisedurumu: "",
            liseturu: "",
            meslekibrans: "",
            universitedurumu: "",
            universitebolum: "",
          },
          history: historyData || {
            isyerleri: "",
            gorevpozisyon: "",
            belgeler: "",
            yarismalar: "",
            cv: "",
          }
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  /**
   * Update user profile
   */
  const updateProfile = async (data: Partial<ProfileData>) => {
    if (!userId) {
      toast.error("Kullanıcı bulunamadı");
      return;
    }

    try {
      setLoading(true);
      await profilServisi.guncelle({
        id: userId,
        ...data
      });
      
      // Update profile data in state
      setProfileData(prev => prev ? { ...prev, ...data } : data);
      toast.success("Profil başarıyla güncellendi");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload avatar
   */
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!userId) {
      toast.error("Kullanıcı bulunamadı");
      throw new Error("User ID not found");
    }

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile with avatar URL
      await profilServisi.guncelle({
        id: userId,
        avatarUrl
      });
      
      // Update profile data in state
      setProfileData(prev => prev ? { ...prev, avatarUrl } : { avatarUrl });
      
      toast.success("Profil fotoğrafı güncellendi");
      return avatarUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refreshes user profile information
   */
  const refreshProfile = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (!user) {
        setDukkanId(null);
        setDukkanAdi(null);
        setProfileData(null);
        return;
      }

      // Fetch profile data
      const profile = await profilServisi.getir(user.id);
      setProfileData(profile);

      // Get role from user metadata for reliable role checking
      const role = user.user_metadata?.role || (await profileService.getUserRole());

      if (role === "admin") {
        try {
          const userShop = await isletmeServisi.kullanicininIsletmesi(user.id);
          if (userShop) {
            setDukkanId(userShop.id);
            setDukkanAdi(userShop.ad);
          }
        } catch (error) {
          console.error("İşletme bilgisi alınırken hata:", error);
        }
      } else if (role === "staff") {
        try {
          const staffShop = await isletmeServisi.personelAuthIdIsletmesi(user.id);
          if (staffShop) {
            setDukkanId(staffShop.id);
            setDukkanAdi(staffShop.ad);
          }
        } catch (error) {
          console.error("Personel işletme bilgisi alınırken hata:", error);
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  /**
   * Reset all profile information
   */
  const resetProfile = () => {
    setDukkanId(null);
    setDukkanAdi(null);
    setProfileData(null);
  };

  return {
    profileData,
    loading,
    updateProfile,
    uploadAvatar,
    dukkanId,
    dukkanAdi,
    refreshProfile,
    resetProfile,
  };
}
