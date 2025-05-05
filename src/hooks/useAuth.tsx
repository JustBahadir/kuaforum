
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Try to get user role from metadata
      if (session?.user) {
        const role = session.user.user_metadata?.role || null;
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    // THEN check for existing session
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Try to get user role from metadata
        if (data.session?.user) {
          const role = data.session.user.user_metadata?.role || null;
          setUserRole(role);
        }
      } catch (err: any) {
        console.error('Error fetching session:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    userRole,
    signIn,
    signOut,
  };
}
