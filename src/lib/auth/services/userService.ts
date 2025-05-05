
// This file handles user authentication services
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

// Interface for login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration data
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Interface for user profile data
interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  avatar_url?: string;
}

// User service object
export const userService = {
  // Login with email and password
  async login({ email, password }: LoginCredentials): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },
  
  // Register a new user
  async register({ email, password, firstName, lastName }: RegisterData): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            role: 'customer' // Default role
          });
        
        if (profileError) throw profileError;
      }
      
      return { user: data?.user || null, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },
  
  // Log out the current user
  async logout(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
  
  // Get the current logged in user
  async getCurrentUser(): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return { user: data?.user || null, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },
  
  // Get user profile by ID
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return { profile: data as UserProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  },
  
  // Update user profile
  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
};
