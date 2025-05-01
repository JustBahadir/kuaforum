
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';

export function useProfileManagement() {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    iban: '',
    address: '',
    birthdate: '',
    avatar_url: '',
  });

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Get profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Profil bilgileri alınamadı');
        return;
      }

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          iban: data.iban || '',
          address: data.address || '',
          birthdate: data.birthdate || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Profil bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<typeof profileData>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Profil güncellenemedi');
        return false;
      }

      toast.success('Profil başarıyla güncellendi');
      setProfileData((prev) => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenemedi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profileData,
    setProfileData,
    loading,
    fetchProfile,
    updateProfile
  };
}
