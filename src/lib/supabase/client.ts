
import { createClient } from '@supabase/supabase-js';

// Use the values from the Integrations client file which has hardcoded values that work
import { supabase as integrationsSupabase } from '@/integrations/supabase/client';

// Create a consistent Supabase client using the hardcoded values from the integrations client
const supabaseUrl = "https://xkbjjcizncwkrouvoujw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";

// Create a service role client with the same URL but use the service key when available
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; // Fallback to regular client if service key is not available
