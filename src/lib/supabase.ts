
import { createClient } from '@supabase/supabase-js';

// Örnek değerler:
// URL: https://abcdefghijk.supabase.co
// Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...

const supabaseUrl = 'https://abcdefghijk.supabase.co';    // Bu URL'yi kendi Supabase URL'niz ile değiştirin
const supabaseKey = 'your-anon-key';                      // Bu key'i kendi Supabase anon/public key'iniz ile değiştirin

export const supabase = createClient(supabaseUrl, supabaseKey);
