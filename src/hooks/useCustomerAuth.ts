
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useCustomerAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  
  useEffect(() => {
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
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
          setUserRole(null);
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
          .select('id')
          .eq('sahibi_id', user.id)
          .eq('active', true)
          .maybeSingle();
        
        if (!dukkanError && dukkanData) {
          setDukkanId(dukkanData.id);
          return;
        }
      }
      
      // For staff users, get dukkan from personel table
      if (user.user_metadata?.role === 'staff') {
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        if (!personelError && personelData && personelData.dukkan_id) {
          setDukkanId(personelData.dukkan_id);
          return;
        }
      }
      
      // If nothing found, check profile for dukkan_id
      if (profile?.dukkan_id) {
        setDukkanId(profile.dukkan_id);
      }
    } catch (error) {
      console.error('Error fetching dukkan ID:', error);
    }
  };

  return {
    user,
    profile,
    userRole,
    loading,
    dukkanId,
    checkSession,
  };
}
