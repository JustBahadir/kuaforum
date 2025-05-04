
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase URL ve API Key'i
const supabaseUrl = "https://xkbjjcizncwkrouvoujw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk2ODQ3OSwiZXhwIjoyMDU1NTQ0NDc5fQ.dTEvvBlJzzSXsiJjnThD2XxVUHaeqpflVafQiMP5gIw";

// Client oluştur
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Admin client (Service Role key ile) - Dikkatli kullan!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Oturum kontrolü için yardımcı fonksiyon
export async function getOturumKullanicisi() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getKullaniciRolu() {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return null;

  const { data: kullanici } = await supabase
    .from('kullanicilar')
    .select('rol')
    .eq('kimlik', data.user.id)
    .single();

  return kullanici?.rol;
}
