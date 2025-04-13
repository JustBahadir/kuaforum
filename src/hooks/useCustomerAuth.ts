
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProfileManagement } from './auth/useProfileManagement';

export function useCustomerAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [dukkanAdi, setDukkanAdi] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Use our profile management hook
  const profileManagement = useProfileManagement(userRole, !!user, setUserName);
  
  useEffect(() => {
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setUserId(session?.user?.id || null);
        
        if (session?.user) {
          // Get user metadata
          setUserRole(session.user.user_metadata?.role || null);
          
          // Get profile
          await fetchUserProfile(session.user.id);
          
          // Get dukkan ID
          await fetchDukkanId(session.user);
        } else {
          setProfile(null);
          setDukkanId(null);
          setDukkanAdi(null);
          setUserRole(null);
          setUserName("");
          setUserId(null);
        }
      }
    );

    // Initial session check
    checkSession();
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setUserId(session?.user?.id || null);
      
      if (session?.user) {
        // Get user metadata
        setUserRole(session.user.user_metadata?.role || null);
        
        // Get profile data
        await fetchUserProfile(session.user.id);
        
        // Get dukkan ID
        await fetchDukkanId(session.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(profile);
      
      // If role isn't set in the auth metadata, fallback to profile role
      if (!userRole && profile?.role) {
        setUserRole(profile.role);
      }
      
      // Set user name for display
      if (profile?.first_name || profile?.last_name) {
        setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const fetchDukkanId = async (user: any) => {
    try {
      // First try getting from user metadata (for admin users)
      if (user.user_metadata?.role === 'admin') {
        // Check for dukkan where user is the owner
        const { data: dukkanData, error: dukkanError } = await supabase
          .from('dukkanlar')
          .select('id, ad')
          .eq('sahibi_id', user.id)
          .eq('active', true)
          .maybeSingle();
        
        if (!dukkanError && dukkanData) {
          setDukkanId(dukkanData.id);
          setDukkanAdi(dukkanData.ad);
          return;
        }
      }
      
      // For staff users, get dukkan from personel table
      if (user.user_metadata?.role === 'staff') {
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .select('dukkan_id, dukkanlar:dukkan_id(ad)')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        if (!personelError && personelData && personelData.dukkan_id) {
          setDukkanId(personelData.dukkan_id);
          setDukkanAdi(personelData.dukkanlar?.ad || null);
          return;
        }
      }
      
      // If nothing found, check profile for dukkan_id
      if (profile?.dukkan_id) {
        setDukkanId(profile.dukkan_id);
        // Try to get dukkan name
        const { data } = await supabase
          .from('dukkanlar')
          .select('ad')
          .eq('id', profile.dukkan_id)
          .single();
        if (data) {
          setDukkanAdi(data.ad);
        }
      }
    } catch (error) {
      console.error('Error fetching dukkan ID:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserId(null);
      setProfile(null);
      setUserRole(null);
      setDukkanId(null);
      setDukkanAdi(null);
      setUserName("");
      profileManagement.resetProfile();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Function to refresh profile and dukkan data
  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchUserProfile(user.id);
    await fetchDukkanId(user);
    return profileManagement.refreshProfile();
  };
  
  // Check if the user is authenticated
  const isAuthenticated = !!user;

  return {
    user,
    profile,
    userRole,
    loading,
    dukkanId,
    dukkanAdi,
    userName,
    userId,
    isAuthenticated,
    activeTab,
    checkSession,
    handleLogout,
    refreshProfile,
    ...profileManagement
  };
}
