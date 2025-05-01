
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
import { customerPreferencesService } from './services/customerPreferencesService';
import { customerPersonalDataService } from './services/customerPersonalDataService';

// Import and export types
import type { 
  Personel, 
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
  customerPreferencesService,
  customerPersonalDataService,
  
  // Types
  type Personel,
  type PersonelIslemi,
  type PersonelEgitim,
  type PersonelGecmis,
  type ProfileUpdateData
};
