
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useCustomerAuth() {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [dukkanId, setDukkanId] = useState<number>(0);
  const [dukkanAdi, setDukkanAdi] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);

  // Add a function to clear any pending timeouts to prevent memory leaks
  const clearAuthTimeout = () => {
    if (authTimeout) {
      clearTimeout(authTimeout);
      setAuthTimeout(null);
    }
  };

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          setLoading(false);
          setIsAuthenticated(false);
          return;
        }

        if (data?.session) {
          // User is authenticated
          setIsAuthenticated(true);
          setUserId(data.session.user.id);
          
          // First try to get user metadata from the session
          const metadata = data.session.user.user_metadata;
          if (metadata) {
            setUserName(`${metadata.first_name || ''} ${metadata.last_name || ''}`.trim());
            setUserRole(metadata.role || 'customer');
            
            // If user is staff or admin, attempt to fetch their dukkan information
            if (metadata.role === 'staff' || metadata.role === 'admin') {
              try {
                // For admin, check if they own a dukkan
                if (metadata.role === 'admin') {
                  const { data: dukkanData, error: dukkanError } = await supabase
                    .from('dukkanlar')
                    .select('*')
                    .eq('sahibi_id', data.session.user.id)
                    .single();
                    
                  if (!dukkanError && dukkanData) {
                    setDukkanId(dukkanData.id);
                    setDukkanAdi(dukkanData.ad || '');
                  }
                } 
                
                // For staff, check the personel table to find their dukkan
                if (metadata.role === 'staff') {
                  const { data: staffData, error: staffError } = await supabase
                    .from('personel')
                    .select('dukkan_id')
                    .eq('auth_id', data.session.user.id)
                    .single();
                    
                  if (!staffError && staffData && staffData.dukkan_id) {
                    setDukkanId(staffData.dukkan_id);
                    
                    // Get the dukkan name
                    const { data: dukkanData, error: dukkanNameError } = await supabase
                      .from('dukkanlar')
                      .select('ad')
                      .eq('id', staffData.dukkan_id)
                      .single();
                      
                    if (!dukkanNameError && dukkanData) {
                      setDukkanAdi(dukkanData.ad || '');
                    }
                  }
                }
              } catch (innerError) {
                console.error('Error fetching dukkan data:', innerError);
              }
            }
          } else {
            // Fall back to profiles table if metadata is not available
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, role, dukkan_id')
                .eq('id', data.session.user.id)
                .single();

              if (!profileError && profileData) {
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
              } else {
                console.log('Using user metadata as fallback:', data.session.user.user_metadata);
                
                // Use user metadata as a fallback
                const metadata = data.session.user.user_metadata;
                setUserName(`${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim());
                setUserRole(metadata?.role || 'customer');
              }
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
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

    fetchUserSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          await fetchUserSession();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserName('');
          setUserRole('');
          setDukkanId(0);
          setDukkanAdi('');
          setUserId('');
        }
      }
    );

    // Clean up on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
      clearAuthTimeout();
    };
  }, []);

  const handleLogout = async () => {
    try {
      clearAuthTimeout();
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUserName('');
      setUserRole('');
      setDukkanId(0);
      setDukkanAdi('');
      setUserId('');
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetSession = async () => {
    clearAuthTimeout();
    setLoading(true);
    await fetchUserSession();
    setLoading(false);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, role, dukkan_id')
            .eq('id', data.user.id)
            .single();

          if (!profileError && profileData) {
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
          } else {
            // Use user metadata as a fallback
            const metadata = data.user.user_metadata;
            setUserName(`${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim());
            setUserRole(metadata?.role || 'customer');
          }
        } catch (error) {
          console.error('Profile refresh error:', error);
        }
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  const fetchUserSession = async () => {
    clearAuthTimeout();
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
        
        // First check metadata
        const metadata = data.session.user.user_metadata;
        if (metadata) {
          setUserName(`${metadata.first_name || ''} ${metadata.last_name || ''}`.trim());
          setUserRole(metadata.role || 'customer');
          
          // If staff or admin, get dukkan info
          if (metadata.role === 'admin') {
            const { data: dukkanData, error: dukkanError } = await supabase
              .from('dukkanlar')
              .select('*')
              .eq('sahibi_id', data.session.user.id)
              .single();
              
            if (!dukkanError && dukkanData) {
              setDukkanId(dukkanData.id);
              setDukkanAdi(dukkanData.ad || '');
            }
          } else if (metadata.role === 'staff') {
            const { data: staffData, error: staffError } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', data.session.user.id)
              .single();
              
            if (!staffError && staffData && staffData.dukkan_id) {
              setDukkanId(staffData.dukkan_id);
              
              const { data: dukkanData, error: dukkanNameError } = await supabase
                .from('dukkanlar')
                .select('ad')
                .eq('id', staffData.dukkan_id)
                .single();
                
              if (!dukkanNameError && dukkanData) {
                setDukkanAdi(dukkanData.ad || '');
              }
            }
          }
        } else {
          // Try to get profile data
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, role, dukkan_id')
              .eq('id', data.session.user.id)
              .single();

            if (!profileError && profileData) {
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
          } catch (profileError) {
            console.error('Error fetching profile data:', profileError);
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
    setActiveTab,
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
