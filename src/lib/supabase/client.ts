
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xkbjjcizncwkrouvoujw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";
// Service role key should be used very carefully, only on server-side or in admin contexts
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk2ODQ3OSwiZXhwIjoyMDU1NTQ0NDc5fQ.dTEvvBlJzzSXsiJjnThD2XxVUHaeqpflVafQiMP5gIw";

// Create the regular client with anon key
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Disable persistent sessions
    autoRefreshToken: false, // Disable auto refresh of token
    storage: undefined, // Don't use any storage
  },
});

// Create an admin client with service role key (should be used with caution, only for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Disable persistent sessions
    autoRefreshToken: false, // Disable auto refresh of token
    storage: undefined, // Don't use any storage
  },
});
