import { createClient } from '@supabase/supabase-js';

// Bu değerleri Supabase proje ayarlarınızdan alıp değiştirin
const supabaseUrl = 'BURAYA_SUPABASE_PROJECT_URL';
const supabaseKey = 'BURAYA_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);