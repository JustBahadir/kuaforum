
// Export all Supabase services
import { supabase } from './client';
import { authService } from '@/lib/auth/authService';

// Import and export services
import { islemServisi } from './services/islemServisi';
import { kategorilerServisi, kategoriServisi } from './services/kategoriServisi';
import { randevuServisi } from './services/randevuServisi';
import { musteriServisi } from './services/musteriServisi';
import { personelServisi } from './services/personelServisi';
import { isletmeServisi, dukkanServisi } from './services/dukkanServisi';
import { personelIslemleriServisi } from './services/personelIslemleriServisi';
import { calismaSaatleriServisi } from './services/calismaSaatleriServisi';
import { profileService } from './services/profileService';
import { notificationsService } from './services/notificationsService';

// Import and export types
import type { 
  PersonelIslemi, 
  PersonelEgitim, 
  PersonelGecmis,
  ProfileUpdateData 
} from '@/types/personnel';

export {
  // Client
  supabase,
  
  // Auth
  authService,
  
  // Services
  islemServisi,
  kategorilerServisi,
  kategoriServisi,
  randevuServisi,
  musteriServisi,
  personelServisi,
  isletmeServisi,
  dukkanServisi,
  personelIslemleriServisi,
  calismaSaatleriServisi,
  profileService,
  notificationsService,
  
  // Types
  type PersonelIslemi,
  type PersonelEgitim,
  type PersonelGecmis,
  type ProfileUpdateData
};
