
import { supabase } from './client';
import { dukkanServisi } from './services/dukkanServisi';
import { islemServisi } from './services/islemServisi';
import { kategorilerServisi } from './services/kategoriServisi';
import { musteriServisi } from './services/musteriServisi';
import { personelServisi } from './services/personelServisi';
import { randevuServisi } from './services/randevuServisi';
import { siralamaServisi } from './services/siralamaServisi';
import { profilServisi } from './services/profilServisi';
import { bildirimServisi } from './services/bildirimServisi';
import { calismaSaatleriServisi } from './services/calismaSaatleriServisi';
import { personelIslemleriServisi } from './services/personelIslemleriServisi';

// Re-export services
export {
  supabase,
  dukkanServisi,
  islemServisi,
  kategorilerServisi,
  musteriServisi,
  personelServisi,
  randevuServisi,
  siralamaServisi,
  profilServisi,
  bildirimServisi,
  calismaSaatleriServisi,
  personelIslemleriServisi
};

// For backward compatibility
export const kategoriServisi = kategorilerServisi;
