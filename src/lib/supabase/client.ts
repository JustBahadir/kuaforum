
import { createClient } from '@supabase/supabase-js';

// Supabase API anahtarları
const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk2ODQ3OSwiZXhwIjoyMDU1NTQ0NDc5fQ.U5wm2YLG-9PyW41-vZaZ13-JCFGEltdYJDi5jgUvRo4';

// Normal kullanıcı işlemleri için client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin işlemleri için service_role client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Basit session yenileme fonksiyonu
export async function refreshSupabaseSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Session yenileme hatası:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Session yenileme sırasında hata:", err);
    return false;
  }
}
