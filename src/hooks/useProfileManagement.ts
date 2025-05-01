
import { useState } from "react";
import { profileService } from "@/lib/auth/profileService";
import { dukkanServisi } from "@/lib/supabase"; 
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Profil } from "@/lib/supabase/types";

/**
 * Hook for managing user profile information
 */
export function useProfileManagement(userId?: string | undefined) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  /**
   * Fetches the user profile data
   */
  const fetchProfileData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch profile data
      const profile = await profileService.getProfile(userId);
      
      // Get education and work history data
      let educationData = null;
      let historyData = null;
      
      try {
        if (profile?.personel_id) {
          // Assuming there's a staff_education table with personel_id foreign key
          const { data: education } = await supabase
            .from('staff_education')
            .select('*')
            .eq('personel_id', profile.personel_id)
            .maybeSingle();
          
          educationData = education;
        }
      } catch (error) {
        console.log('Education data not found or error', error);
      }
      
      try {
        if (profile?.personel_id) {
          // Assuming there's a staff_history table with personel_id foreign key
          const { data: history } = await supabase
            .from('staff_history')
            .select('*')
            .eq('personel_id', profile.personel_id)
            .maybeSingle();
          
          historyData = history;
        }
      } catch (error) {
        console.log('History data not found or error', error);
      }
      
      setProfileData({
        ...profile,
        education: educationData,
        history: historyData
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profil bilgileri alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Updates the user profile
   */
  const updateProfile = async (data: any) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await profileService.updateProfile(userId, data);
      
      toast.success("Profil bilgileri başarıyla güncellendi");
      await fetchProfileData(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Updates the education data
   */
  const updateEducation = async (data: any) => {
    if (!profileData?.personel_id) {
      toast.error("Personel bilgisi bulunamadı");
      return;
    }
    
    setLoading(true);
    try {
      const educationData = {
        ...data,
        personel_id: profileData.personel_id
      };
      
      // Check if education record exists
      const { data: existingData } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', profileData.personel_id)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        await supabase
          .from('staff_education')
          .update(educationData)
          .eq('personel_id', profileData.personel_id);
      } else {
        // Insert new record
        await supabase
          .from('staff_education')
          .insert([educationData]);
      }
      
      toast.success("Eğitim bilgileri başarıyla güncellendi");
      await fetchProfileData(); // Refresh data
    } catch (error) {
      console.error("Error updating education:", error);
      toast.error("Eğitim bilgileri güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Updates the work history data
   */
  const updateHistory = async (data: any) => {
    if (!profileData?.personel_id) {
      toast.error("Personel bilgisi bulunamadı");
      return;
    }
    
    setLoading(true);
    try {
      const historyData = {
        ...data,
        personel_id: profileData.personel_id
      };
      
      // Check if history record exists
      const { data: existingData } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', profileData.personel_id)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        await supabase
          .from('staff_history')
          .update(historyData)
          .eq('personel_id', profileData.personel_id);
      } else {
        // Insert new record
        await supabase
          .from('staff_history')
          .insert([historyData]);
      }
      
      toast.success("İş geçmişi bilgileri başarıyla güncellendi");
      await fetchProfileData(); // Refresh data
    } catch (error) {
      console.error("Error updating history:", error);
      toast.error("İş geçmişi bilgileri güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Uploads avatar image
   */
  const uploadAvatar = async (file: File) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage
        .createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2 // 2MB
        });
        
      if (bucketError && bucketError.message !== "Bucket already exists") {
        console.error("Bucket creation error:", bucketError);
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the profile with the new avatar URL
      await profileService.updateProfile(userId, {
        avatar_url: data.publicUrl
      });
      
      toast.success("Profil fotoğrafı başarıyla güncellendi");
      await fetchProfileData(); // Refresh data
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Uploads CV file
   */
  const uploadCv = async (file: File) => {
    if (!profileData?.personel_id) {
      toast.error("Personel bilgisi bulunamadı");
      return;
    }
    
    setLoading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `cv-${profileData.personel_id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      // Create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage
        .createBucket('documents', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 10 // 10MB
        });
        
      if (bucketError && bucketError.message !== "Bucket already exists") {
        console.error("Bucket creation error:", bucketError);
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Update the staff_history with the CV URL
      const { data: historyData } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', profileData.personel_id)
        .maybeSingle();
      
      if (historyData) {
        await supabase
          .from('staff_history')
          .update({ cv: data.publicUrl })
          .eq('personel_id', profileData.personel_id);
      } else {
        await supabase
          .from('staff_history')
          .insert([{
            personel_id: profileData.personel_id,
            cv: data.publicUrl,
            isyerleri: '',
            gorevpozisyon: '',
            belgeler: '',
            yarismalar: ''
          }]);
      }
      
      toast.success("CV başarıyla yüklendi");
      await fetchProfileData(); // Refresh data
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      toast.error("CV yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    profileData,
    loading,
    fetchProfileData,
    updateProfile,
    updateEducation,
    updateHistory,
    uploadAvatar,
    uploadCv
  };
}
