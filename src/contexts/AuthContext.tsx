
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { KullaniciRol } from "@/lib/supabase/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: KullaniciRol | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Adding required fields for compatibility
  isAuthenticated: boolean;
  userName: string;
  profileData: any;
  handleLogout: () => Promise<void>;
  userId?: string;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<KullaniciRol | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    async function loadUserAndSession() {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth event:", event);
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
              await loadUserRole(newSession.user.id);
              await loadProfileData(newSession.user.id);
              
              // If this is a new sign-in, attempt to create user in kullanicilar table
              if (event === 'SIGNED_IN') {
                try {
                  const { data: existingUser } = await supabase
                    .from('kullanicilar')
                    .select('*')
                    .eq('auth_id', newSession.user.id)
                    .maybeSingle();
                  
                  if (!existingUser) {
                    // User doesn't exist in kullanicilar table
                    console.log("New user signed in, calling handle-user-signup function");
                    
                    // Call our edge function to create the user
                    try {
                      await supabase.functions.invoke('handle-user-signup', {
                        body: { userId: newSession.user.id }
                      });
                    } catch (error) {
                      console.error("Error calling handle-user-signup function:", error);
                    }
                  }
                } catch (err) {
                  console.error("Error checking/creating user profile:", err);
                }
              }
            } else {
              setUserRole(null);
              setProfileData(null);
            }
          }
        );

        // THEN check for existing session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        if (sessionData.session?.user) {
          setUser(sessionData.session.user);
          await loadUserRole(sessionData.session.user.id);
          await loadProfileData(sessionData.session.user.id);
        }

        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Auth context error:", error);
        setLoading(false);
      }
    }

    loadUserAndSession();
  }, []);

  async function loadUserRole(userId: string) {
    try {
      const { data: kullanici, error } = await supabase
        .from("kullanicilar")
        .select("rol")
        .eq("auth_id", userId)
        .single();

      if (error) {
        console.error("Kullanıcı rolü alınamadı:", error);
        return;
      }

      // Add null check to prevent TypeScript errors
      if (kullanici) {
        setUserRole(kullanici.rol || null);
      }
    } catch (error) {
      console.error("Role loading error:", error);
    }
  }

  async function loadProfileData(userId: string) {
    try {
      const { data, error } = await supabase
        .from("kullanicilar")
        .select("*")
        .eq("auth_id", userId)
        .single();

      if (error) {
        console.error("Profil bilgileri alınamadı:", error);
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error("Profile loading error:", error);
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-google-callback`,
        },
      });

      if (error) {
        toast.error("Google ile giriş başarısız");
        console.error("Google login error:", error);
      }
    } catch (error) {
      toast.error("Giriş yapılamadı");
      console.error("Sign in error:", error);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Çıkış yapılamadı");
        console.error("Sign out error:", error);
      } else {
        toast.success("Başarıyla çıkış yapıldı");
      }
    } catch (error) {
      toast.error("Çıkış yapılamadı");
      console.error("Sign out error:", error);
    }
  }

  const isAuthenticated = !!session;
  const userName = profileData ? `${profileData.ad} ${profileData.soyad}` : "";
  const userId = user?.id;

  const handleLogout = async () => {
    await signOut();
  };

  const value = {
    session,
    user,
    userRole,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated,
    userName,
    profileData,
    handleLogout,
    userId,
    activeTab,
    setActiveTab,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
