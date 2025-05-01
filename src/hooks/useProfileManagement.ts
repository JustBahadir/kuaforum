import { useState, useEffect } from "react";
import { profileService } from "@/lib/auth/profileService";
import { dukkanServisi } from "@/lib/supabase"; // Updated import
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { supabase } from "@/lib/supabase/client";

type GenderType = "erkek" | "kadın" | null;

type ProfileData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: GenderType;
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
        // Get user auth data for email
        const { data: authUser } = await supabase.auth.getUser();
        const userEmail = authUser?.user?.email || '';
        
        // Get profile data
        const profile = await profilServisi.getir(userId);
        
        // Fetch education and history data
        const { data: educationData } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', userId)
          .maybeSingle();
          
        const { data: historyData } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', userId)
          .maybeSingle();

        // Cast gender to the correct type
        const typedProfile: ProfileData = {
          ...profile,
          firstName: profile.first_name || authUser?.user?.user_metadata?.first_name || '',
          lastName: profile.last_name || authUser?.user?.user_metadata?.last_name || '',
          email: userEmail,
          gender: (profile.gender as GenderType) || null,
          avatarUrl: profile.avatar_url,
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
        };
        
        setProfileData(typedProfile);
        console.log("Profile data loaded:", typedProfile);
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
      
      // Prepare data for the profiles table
      const profileUpdate = {
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        gender: data.gender,
        birthdate: data.birthdate,
        iban: data.iban,
        address: data.address
      };
      
      await profilServisi.guncelle(profileUpdate);
      
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
      
      // Check if profile-photos bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile-photos');
      
      if (!bucketExists) {
        // Create a more user-friendly error message
        toast.error("Profil fotoğrafı yükleme sistemi hazır değil. Lütfen sistem yöneticisiyle iletişime geçin.");
        throw new Error("Storage bucket 'profile-photos' not found");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with avatar URL
      await profilServisi.guncelle({
        id: userId,
        avatar_url: avatarUrl
      });
      
      // Update profile data in state
      setProfileData(prev => {
        if (prev) {
          return { ...prev, avatarUrl };
        }
        return { avatarUrl };
      });
      
      toast.success("Profil fotoğrafı güncellendi");
      return avatarUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      
      if (error.message?.includes("Bucket not found")) {
        toast.error("Profil fotoğrafı yükleme alanı bulunamadı. Sistem yöneticisiyle iletişime geçin.");
      } else {
        toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
      }
      
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
      
      // Cast gender to the correct type
      setProfileData({
        ...profile,
        gender: (profile.gender as any) || null
      });

      // Get role from user metadata for reliable role checking
      const role = user.user_metadata?.role || (await profileService.getUserRole());

      if (role === "admin") {
        try {
          // Use dukkanServisi instead of isletmeServisi
          const userShop = await dukkanServisi.kullanicininIsletmesi(user.id);
          if (userShop) {
            setDukkanId(userShop.id);
            setDukkanAdi(userShop.ad);
          }
        } catch (error) {
          console.error("İşletme bilgisi alınırken hata:", error);
        }
      } else if (role === "staff") {
        try {
          // Use dukkanServisi instead of isletmeServisi
          const staffShop = await dukkanServisi.personelAuthIdIsletmesi(user.id);
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
