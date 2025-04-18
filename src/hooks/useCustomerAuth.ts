
import React, { useState, useEffect } from 'react';
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

  const fetchUserSession = async () => {
    try {
      setLoading(true);
      
      // Get session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (data?.session) {
        // User is authenticated
        setIsAuthenticated(true);
        setUserId(data.session.user.id);
        
        // Get role and user profile using edge function
        try {
          const { data: userData, error: userDataError } = await supabase.functions.invoke('get_current_user_role');
          
          if (userDataError) {
            console.error('Error fetching user data:', userDataError);
          } else {
            console.log("User data from edge function:", userData);
            
            // Set role and user data from edge function response
            // Make sure to check for business_owner role too
            const role = userData?.role || 'customer';
            setUserRole(role);
            
            // For backward compatibility, treat 'admin' and 'business_owner' the same
            if (role === 'admin' || role === 'business_owner') {
              console.log("User is admin or business owner");
            }
            
            // Set user name from profile data
            if (userData?.profile) {
              const profile = userData.profile;
              setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Kullanıcı');
            }
            
            // Set dukkan data if available
            if (userData?.personnel?.dukkan_id) {
              setDukkanId(userData.personnel.dukkan_id);
              
              // Get dukkan name if available
              if (userData.dukkan) {
                setDukkanAdi(userData.dukkan.ad || '');
              }
            } else if (userData?.role === 'business_owner' || userData?.role === 'admin') {
              // For business owner, fetch dukkan data directly
              const { data: dukkanData } = await supabase
                .from('dukkanlar')
                .select('id, ad')
                .eq('sahibi_id', data.session.user.id)
                .single();
                
              if (dukkanData) {
                console.log("Found dukkan data for business owner:", dukkanData);
                setDukkanId(dukkanData.id);
                setDukkanAdi(dukkanData.ad || '');
              } else {
                console.log("No dukkan found for business owner");
              }
            }
          }
        } catch (fetchError) {
          console.error('Error fetching user data:', fetchError);
          
          // Fallback to user metadata if edge function fails
          const metadata = data.session.user.user_metadata;
          if (metadata) {
            setUserName(`${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || 'Kullanıcı');
            setUserRole(metadata.role || 'customer');
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

  useEffect(() => {
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
    };
  }, []);

  const handleLogout = async () => {
    try {
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

  // Function to refresh user profile
  const refreshProfile = async () => {
    return await fetchUserSession();
  };

  return {
    userName,
    loading,
    activeTab,
    setActiveTab,
    handleLogout,
    userRole,
    isAuthenticated,
    dukkanId,
    dukkanAdi,
    userId,
    refreshProfile
  };
}
