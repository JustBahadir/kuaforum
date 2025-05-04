
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type KullaniciRol = "isletme_sahibi" | "personel" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: KullaniciRol;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<KullaniciRol>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAndSession() {
      try {
        // Mevcut oturum bilgisini al
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);
          await loadUserRole(currentSession.user.id);
        }

        // Oturum değişikliklerini dinle
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth event:", event);
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
              await loadUserRole(newSession.user.id);
            } else {
              setUserRole(null);
            }
          }
        );

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
        .eq("kimlik", userId)
        .single();

      if (error) {
        console.error("Kullanıcı rolü alınamadı:", error);
        return;
      }

      setUserRole(kullanici?.rol || null);
    } catch (error) {
      console.error("Role loading error:", error);
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
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

  const value = {
    session,
    user,
    userRole,
    loading,
    signInWithGoogle,
    signOut,
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
