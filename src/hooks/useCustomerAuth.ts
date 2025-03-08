
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useCustomerAuth() {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [dukkanId, setDukkanId] = useState<number>(0);
  const [dukkanAdi, setDukkanAdi] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          setLoading(false);
          return;
        }

        if (data?.session) {
          // User is authenticated
          setIsAuthenticated(true);
          setUserId(data.session.user.id);
          
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, role, dukkan_id')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
          } else if (profileData) {
            setUserName(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim());
            setUserRole(profileData.role || 'customer');
            
            // If user has a dukkan_id, fetch the shop name
            if (profileData.dukkan_id) {
              setDukkanId(profileData.dukkan_id);
              
              const { data: dukkanData, error: dukkanError } = await supabase
                .from('dukkanlar')
                .select('ad')
                .eq('id', profileData.dukkan_id)
                .single();
                
              if (!dukkanError && dukkanData) {
                setDukkanAdi(dukkanData.ad);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetSession = async () => {
    await fetchUserSession();
  };

  const refreshProfile = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, dukkan_id')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile refresh error:', profileError);
        } else if (profileData) {
          setUserName(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim());
          setUserRole(profileData.role || 'customer');
          
          if (profileData.dukkan_id) {
            setDukkanId(profileData.dukkan_id);
            
            const { data: dukkanData, error: dukkanError } = await supabase
              .from('dukkanlar')
              .select('ad')
              .eq('id', profileData.dukkan_id)
              .single();
              
            if (!dukkanError && dukkanData) {
              setDukkanAdi(dukkanData.ad);
            }
          }
        }
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  const fetchUserSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        setIsAuthenticated(false);
        return;
      }

      if (data?.session) {
        setIsAuthenticated(true);
        setUserId(data.session.user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role, dukkan_id')
          .eq('id', data.session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else if (profileData) {
          setUserName(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim());
          setUserRole(profileData.role || 'customer');
          
          if (profileData.dukkan_id) {
            setDukkanId(profileData.dukkan_id);
            
            const { data: dukkanData, error: dukkanError } = await supabase
              .from('dukkanlar')
              .select('ad')
              .eq('id', profileData.dukkan_id)
              .single();
              
            if (!dukkanError && dukkanData) {
              setDukkanAdi(dukkanData.ad);
            }
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    userName,
    loading,
    activeTab,
    handleLogout,
    resetSession,
    refreshProfile,
    userRole,
    isAuthenticated,
    dukkanId,
    dukkanAdi,
    userId
  };
}
