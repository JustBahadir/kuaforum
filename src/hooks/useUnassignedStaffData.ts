import { useState, useCallback } from "react";
import { profileService } from "@/lib/auth/profileService";
import { authService } from "@/lib/auth/authService";
import { staffService } from "@/lib/auth/services/staffService";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export type EducationData = {
  ortaokuldurumu?: string;
  lisedurumu?: string;
  liseturu?: string;
  universitedurumu?: string;
  universitebolum?: string;
  meslekibrans?: string;
};

export type HistoryData = {
  isyerleri?: string;
  gorevpozisyon?: string;
  belgeler?: string;
  yarismalar?: string;
  cv?: string;
};

export const useUnassignedStaffData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [personelId, setPersonelId] = useState<number | null>(null);
  const [educationData, setEducationData] = useState<EducationData>({});
  const [historyData, setHistoryData] = useState<HistoryData>({});
  const [isUploading, setIsUploading] = useState(false);

  const loadUserAndStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Get user's profile
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get profile
      const profile = await profileService.getProfile(user);
      setUserProfile(profile);

      // Get staff data
      try {
        const staffData = await staffService.getStaffData();
        
        if (staffData && staffData.id) {
          setPersonelId(staffData.id);
          
          // Load education data
          const education = await staffService.getEducationData(staffData.id);
          setEducationData(education || {});
          
          // Load history data
          const history = await staffService.getHistoryData(staffData.id);
          setHistoryData(history || {});
        }
      } catch (staffError) {
        console.warn("Staff data not found:", staffError);
        // This is normal for non-staff users
      }

    } catch (err: any) {
      console.error("Error loading user and staff data:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Replace authService.logout() with supabase.auth.signOut()
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Error logging out:", err);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  const saveUserData = async (updatedData: any) => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Determine what type of data is being updated
      if (updatedData.education) {
        // Save education data
        if (personelId) {
          await staffService.saveEducationData(personelId, updatedData.education);
          setEducationData(updatedData.education);
        }
      } else if (updatedData.history) {
        // Save history data
        if (personelId) {
          await staffService.saveHistoryData(personelId, updatedData.history);
          setHistoryData(updatedData.history);
        }
      } else {
        // Save profile data
        await profileService.updateProfile(user.id, updatedData);
        setUserProfile({ ...userProfile, ...updatedData });
      }

      return true;
    } catch (err: any) {
      console.error("Error saving user data:", err);
      toast.error(`Veri kaydedilirken bir hata oluştu: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<void> => {
    try {
      setIsUploading(true);
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('shop-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('shop-photos')
        .getPublicUrl(filePath);

      // Update user avatar URL in database
      await profileService.updateProfile(user.id, { 
        avatar_url: publicUrlData.publicUrl 
      });

      // Update local state
      setUserProfile({
        ...userProfile,
        avatar_url: publicUrlData.publicUrl
      });

      toast.success("Profil fotoğrafı güncellendi");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(`Yükleme hatası: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    loading,
    error,
    userProfile,
    personelId,
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    handleLogout,
    saveUserData,
    loadUserAndStaffData,
    handleAvatarUpload,
    isUploading
  };
};
