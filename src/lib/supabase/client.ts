
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk2ODQ3OSwiZXhwIjoyMDU1NTQ0NDc5fQ.U5wm2YLG-9PyW41-vZaZ13-JCFGEltdYJDi5jgUvRo4';

// Create normal client with persistent sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'salon-auth-storage-key',
  }
});

// Create admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Helper function to refresh session explicitly
export async function refreshSupabaseSession() {
  try {
    console.log("Oturum yenileniyor...");
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Oturum yenileme hatası:", error);
      return { success: false, error };
    }
    
    console.log("Oturum başarıyla yenilendi");
    return { success: true, data };
  } catch (err) {
    console.error("Oturum yenileme sırasında hata:", err);
    return { success: false, error: err };
  }
}
