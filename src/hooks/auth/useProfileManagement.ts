
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { personelServisi } from '@/lib/supabase';
import { toast } from 'sonner';

interface EducationData {
  ortaokuldurumu?: string;
  lisedurumu?: string;
  liseturu?: string;
  universitedurumu?: string;
  universitebolum?: string;
  meslekibrans?: string;
}

interface HistoryData {
  isyerleri?: string;
  gorevpozisyon?: string;
  yarismalar?: string;
  belgeler?: string;
  cv?: string;
}

interface ProfileManagement {
  loading: boolean;
  error: string;
  userProfile: any;
  educationData: EducationData;
  setEducationData: React.Dispatch<React.SetStateAction<EducationData>>;
  historyData: HistoryData;
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryData>>;
  saveUserData: (data: any) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleAvatarUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  loadUserAndStaffData: () => Promise<void>;
}

export function useProfileManagement(): ProfileManagement {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [educationData, setEducationData] = useState<EducationData>({});
  const [historyData, setHistoryData] = useState<HistoryData>({});
  const [isUploading, setIsUploading] = useState(false);
  const [staffId, setStaffId] = useState<number | null>(null);

  const loadUserAndStaffData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      setUserProfile(profile);
      
      // Check if user is a staff member
      const { data: staffData, error: staffError } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (staffError && staffError.code !== 'PGRST116') {
        console.error('Staff data fetch error:', staffError);
      }
      
      if (staffData) {
        // Set the staff ID for later use
        setStaffId(staffData.id as number);
        
        // Fetch education data
        const { data: educationData, error: eduError } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', staffData.id)
          .maybeSingle();
        
        if (!eduError && educationData) {
          setEducationData(educationData);
        }
        
        // Fetch history data
        const { data: historyData, error: histError } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', staffData.id)
          .maybeSingle();
        
        if (!histError && historyData) {
          setHistoryData(historyData);
        }
      }
    } catch (err: any) {
      console.error('Error loading profile data:', err);
      setError(err.message || 'Profil yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndStaffData();
  }, []);

  const saveUserData = async (data: any) => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      if (data.education && staffId) {
        // Update or insert education data
        const { error: eduError } = await supabase
          .from('staff_education')
          .upsert({
            ...data.education,
            personel_id: staffId,
          });
        
        if (eduError) throw eduError;
        setEducationData(prev => ({ ...prev, ...data.education }));
      }
      
      if (data.history && staffId) {
        // Update or insert history data
        const { error: histError } = await supabase
          .from('staff_history')
          .upsert({
            ...data.history,
            personel_id: staffId,
          });
        
        if (histError) throw histError;
        setHistoryData(prev => ({ ...prev, ...data.history }));
      }
      
      // Update profile data if anything else is present
      const profileUpdates = { ...data };
      delete profileUpdates.education;
      delete profileUpdates.history;
      
      if (Object.keys(profileUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        setUserProfile(prev => ({ ...prev, ...profileUpdates }));
      }
      
      toast.success('Bilgileriniz başarıyla güncellendi');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error('Bilgiler kaydedilirken bir hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Error signing out:', err);
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update the user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // If user is also a staff member, update their avatar
      if (staffId) {
        await personelServisi.guncelle(staffId, { avatar_url: publicUrlData.publicUrl });
      }
      
      setUserProfile(prev => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
      toast.success('Profil fotoğrafı güncellendi');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast.error('Profil fotoğrafı yüklenirken bir hata oluştu');
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
    saveUserData,
    handleLogout,
    handleAvatarUpload,
    isUploading,
    loadUserAndStaffData
  };
}
