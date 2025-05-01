
import { useState, useCallback } from "react";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { staffService } from "@/lib/auth/services/staffService";
import { useNavigate } from "react-router-dom";
import { uploadToSupabase } from "@/lib/supabase/storage";

// Define types for education and history data
export interface EducationData {
  ortaokuldurumu: string;
  meslekibrans: string;
  universitedurumu: string;
  universitebolum: string;
  liseturu: string;
  lisedurumu: string;
}

export interface HistoryData {
  isyerleri: string[];
  gorevpozisyon: string[];
  belgeler: string[];
  yarismalar: string[];
  cv: string;
}

export function useUnassignedStaffData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [educationData, setEducationData] = useState<EducationData>({
    ortaokuldurumu: "",
    meslekibrans: "",
    universitedurumu: "",
    universitebolum: "",
    liseturu: "",
    lisedurumu: "",
  });
  const [historyData, setHistoryData] = useState<HistoryData>({
    isyerleri: [],
    gorevpozisyon: [],
    belgeler: [],
    yarismalar: [],
    cv: "",
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const loadUserAndStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Load user profile
      const userData = await profileService.getCurrentUserProfile();
      setUserProfile(userData);

      // Load education and history data
      if (userData?.id) {
        const staffId = await staffService.getPersonelIdByAuthId(userData.id);
        if (staffId) {
          const [education, history] = await Promise.all([
            staffService.getEducation(staffId),
            staffService.getHistory(staffId),
          ]);

          if (education) {
            setEducationData(education);
          }

          if (history) {
            // Parse array fields from string if necessary
            const parsedHistory = {
              ...history,
              isyerleri: parseArrayField(history.isyerleri),
              gorevpozisyon: parseArrayField(history.gorevpozisyon),
              belgeler: parseArrayField(history.belgeler),
              yarismalar: parseArrayField(history.yarismalar),
              cv: history.cv || "",
            };
            setHistoryData(parsedHistory);
          }
        }
      }
    } catch (err) {
      console.error("Error loading staff data:", err);
      setError("Personel bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse string fields that should be arrays
  const parseArrayField = (field: string | string[]): string[] => {
    if (Array.isArray(field)) return field;
    if (!field) return [];
    try {
      // Try to parse as JSON if it's a string
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If not JSON, split by commas or return as single item
      return field.includes(",") ? field.split(",").map(item => item.trim()) : [field];
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Save user data function
  const saveUserData = async (updatedData: any) => {
    try {
      setLoading(true);
      
      // Update profile data
      if (userProfile?.id) {
        await profileService.updateUserProfile(userProfile.id, updatedData);
        setUserProfile({ ...userProfile, ...updatedData });
      }
      
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!userProfile?.id) return;
    
    try {
      setIsUploading(true);
      
      // Upload image to Supabase storage
      const folderPath = `avatars/${userProfile.id}`;
      const fileName = `avatar-${Date.now()}`;
      const url = await uploadToSupabase(file, folderPath, fileName);
      
      // Update profile with new avatar URL
      await profileService.updateUserProfile(userProfile.id, { avatar_url: url });
      setUserProfile({ ...userProfile, avatar_url: url });
      
      return url;
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    loading,
    error,
    userProfile,
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    handleLogout,
    loadUserAndStaffData,
    saveUserData,
    handleAvatarUpload,
    isUploading
  };
}
