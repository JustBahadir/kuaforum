
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useCustomerAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dukkanId, setDukkanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
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
  }, [navigate]);

  return {
    isAuthenticated,
    userRole,
    userId,
    dukkanId,
    loading
  };
};
