
import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
// In production, these should ONLY be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk2ODQ3OSwiZXhwIjoyMDU1NTQ0NDc5fQ.U5wm2YLG-9PyW41-vZaZ13-JCFGEltdYJDi5jgUvRo4';

// Log the keys for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl);
console.log('Using anon key:', supabaseAnonKey.substring(0, 10) + '...');
console.log('Using service key:', supabaseServiceKey.substring(0, 10) + '...');

// Regular client with anon key for user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

// Admin client with service role key - completely isolated from regular client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Simple function to refresh session
export async function refreshSupabaseSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Session refresh error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error during session refresh:", err);
    return false;
  }
}

// Helper to check if service role key is valid
export async function testServiceRoleKeyValidity() {
  try {
    console.log('Testing service role key validity...');
    
    // Simple query that requires service role
    const { data, error } = await supabaseAdmin.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("Service role key validation failed:", error);
      return false;
    }
    
    console.log('Service role key is valid!');
    return true;
  } catch (err) {
    console.error("Service role key test error:", err);
    return false;
  }
}
