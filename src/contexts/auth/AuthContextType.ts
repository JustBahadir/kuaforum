
import { Session, User } from "@supabase/supabase-js";
import { KullaniciRol } from "@/lib/supabase/types";

export interface AuthContextType {
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
