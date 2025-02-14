
import { createClient } from '@supabase/supabase-js';

// Bu değerleri Supabase proje ayarlarınızdan alıp değiştirin
const supabaseUrl = 'BURAYA_SUPABASE_PROJECT_URL';  // Sizin Supabase URL'niz
const supabaseKey = 'BURAYA_SUPABASE_ANON_KEY';     // Sizin Supabase API Key'iniz

export const supabase = createClient(supabaseUrl, supabaseKey);
