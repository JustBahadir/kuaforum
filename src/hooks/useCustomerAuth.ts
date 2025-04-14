
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
        
        // Get user metadata from session
        const metadata = data.session.user.user_metadata;
        if (metadata) {
          setUserName(`${metadata.first_name || ''} ${metadata.last_name || ''}`.trim());
          setUserRole(metadata.role || 'customer');
          
          // Get dukkan info if needed
          if (metadata.role === 'staff' || metadata.role === 'admin') {
            if (metadata.role === 'admin') {
              const { data: dukkanData } = await supabase
                .from('dukkanlar')
                .select('id, ad')
                .eq('sahibi_id', data.session.user.id)
                .single();
                
              if (dukkanData) {
                setDukkanId(dukkanData.id);
                setDukkanAdi(dukkanData.ad || '');
              }
            } else if (metadata.role === 'staff') {
              const { data: staffData } = await supabase
                .from('personel')
                .select('dukkan_id')
                .eq('auth_id', data.session.user.id)
                .single();
                
              if (staffData?.dukkan_id) {
                setDukkanId(staffData.dukkan_id);
                
                const { data: dukkanData } = await supabase
                  .from('dukkanlar')
                  .select('ad')
                  .eq('id', staffData.dukkan_id)
                  .single();
                  
                if (dukkanData) {
                  setDukkanAdi(dukkanData.ad || '');
                }
              }
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
