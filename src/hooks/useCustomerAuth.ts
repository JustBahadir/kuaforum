import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useCustomerAuth() {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [dukkanId, setDukkanId] = useState<number>(0);
  const [dukkanAdi, setDukkanAdi] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const fetchUserSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth session error:', error);
        setIsAuthenticated(false);
        setUserName('');
        setUserRole(null);
        setDukkanId(0);
        setDukkanAdi('');
        setUserId('');
        return;
      }

      if (data?.session?.user) {
        setIsAuthenticated(true);
        setUserId(data.session.user.id);
        const metadata = data.session.user.user_metadata;
        if (metadata) {
          setUserName(`${metadata.first_name || ''} ${metadata.last_name || ''}`.trim());
          setUserRole(metadata.role || null);

          if (metadata.role === 'admin') {
            const { data: dukkanData, error: dukkanError } = await supabase
              .from('dukkanlar')
              .select('id, ad')
              .eq('sahibi_id', data.session.user.id)
              .single();
            if (!dukkanError && dukkanData) {
              setDukkanId(dukkanData.id);
              setDukkanAdi(dukkanData.ad || '');
            } else {
              setDukkanId(0);
              setDukkanAdi('');
            }
          } else if (metadata.role === 'staff') {
            const { data: staffData, error: staffError } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', data.session.user.id)
              .maybeSingle();
            if (!staffError && staffData?.dukkan_id) {
              setDukkanId(staffData.dukkan_id);
              const { data: dukkanData, error: dukkanError } = await supabase
                .from('dukkanlar')
                .select('ad')
                .eq('id', staffData.dukkan_id)
                .single();
              if (!dukkanError && dukkanData) {
                setDukkanAdi(dukkanData.ad || '');
              } else {
                setDukkanAdi('');
              }
            } else {
              setDukkanId(0);
              setDukkanAdi('');
            }
          } else {
            setDukkanId(0);
            setDukkanAdi('');
          }
        } else {
          setUserName('');
          setUserRole(null);
          setDukkanId(0);
          setDukkanAdi('');
        }
      } else {
        setIsAuthenticated(false);
        setUserName('');
        setUserRole(null);
        setDukkanId(0);
        setDukkanAdi('');
        setUserId('');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUserName('');
      setUserRole(null);
      setDukkanId(0);
      setDukkanAdi('');
      setUserId('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            setIsAuthenticated(true);
            setUserId(session.user.id);

            setUserName('');
            setUserRole(null);
            setDukkanId(0);
            setDukkanAdi('');

            setTimeout(() => {
              fetchUserSession();
            }, 0);
          } else {
            setIsAuthenticated(false);
            setUserName('');
            setUserRole(null);
            setDukkanId(0);
            setDukkanAdi('');
            setUserId('');
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserName('');
          setUserRole(null);
          setDukkanId(0);
          setDukkanAdi('');
          setUserId('');
        }
      }
    });

    fetchUserSession();

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setUserName('');
      setUserRole(null);
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
    refreshProfile,
  };
}
