
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from './auth/useAuthState';
import { useProfileManagement } from './auth/useProfileManagement';
import { useSessionManagement } from './auth/useSessionManagement';

export const useCustomerAuth = () => {
  const {
    userName,
    setUserName,
    userRole, 
    setUserRole,
    loading,
    setLoading,
    isAuthenticated,
    setIsAuthenticated,
    initialLoadDone,
    setInitialLoadDone,
    authCheckInProgress,
    setAuthCheckInProgress,
    activeTab,
    resetAuthState,
  } = useAuthState();

  const [userId, setUserId] = useState<string | null>(null);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  
  const {
    dukkanId: profileDukkanId,
    dukkanAdi,
    refreshProfile: refreshProfileData,
    resetProfile,
  } = useProfileManagement(userRole, isAuthenticated, setUserName);

  const { handleLogout, resetSession } = useSessionManagement(
    resetAuthState,
    resetProfile,
    setInitialLoadDone
  );
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setUserRole(null);
          setUserId(null);
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        setUserId(session.user.id);

        // Get user profile with role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, dukkan_id')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserRole(profile.role);
          setDukkanId(profile.dukkan_id);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserRole(null);
          setUserId(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setIsAuthenticated, setUserRole, setLoading]);

  // Sync dukkanId from profile management
  useEffect(() => {
    if (profileDukkanId !== null) {
      setDukkanId(profileDukkanId);
    }
  }, [profileDukkanId]);

  // Create a wrapper for refreshProfile to handle errors
  const refreshProfile = async () => {
    try {
      await refreshProfileData();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  return {
    isAuthenticated,
    userRole,
    userId,
    dukkanId,
    dukkanAdi,
    loading,
    userName,
    activeTab,
    handleLogout,
    refreshProfile,
    resetSession
  };
};
