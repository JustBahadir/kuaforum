
// Fix import/export name for isletmeServisi, remove nonexistent dukkanServisi reference

export * from './types';
export * from './services/customerOperationsService';
export * from './services/customerPersonalDataService';

// Export services with correct names
export { isletmeServisi } from './services/dukkanServisi';
export { personelServisi } from './services/personelServisi';
export { profilServisi } from './services/profilServisi';
export { randevuServisi } from './services/randevuServisi';
export { islemServisi } from './services/islemServisi';
export { personelIslemleriServisi } from './services/personelIslemleriServisi';
export { kategoriServisi } from './services/kategoriServisi';
export { musteriServisi } from './services/musteriServisi';
export { calismaSaatleriServisi } from './services/calismaSaatleriServisi';
export { bildirimServisi as notificationServisi } from './services/bildirimServisi';
export { customerPersonalDataService } from './services/customerPersonalDataService';
export { customerOperationsService } from './services/customerOperationsService';
export { supabase } from './client';
export { siralamaServisi } from './services/siralamaServisi';

