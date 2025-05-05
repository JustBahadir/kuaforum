
// Lib exports
export * from './client';
export * from './types';

// Type exports (all now properly defined in types.ts)
export type {
  KullaniciRol,
  PersonelDurum,
  RandevuDurum,
  BasvuruDurum,
  Kullanici,
  Isletme,
  Personel,
  IslemKategorisi,
  Hizmet,
  Musteri,
  Randevu,
  PersonelBasvuru,
  CalismaSaati,
  Profil
} from './types';

// Import temporary types while migration is in progress
export type {
  PersonelIslemi,
  PersonelEgitim,
  PersonelGecmis,
  ProfileUpdateData,
  StaffJoinRequest,
} from './temporaryTypes';

// Service exports
export { calismaSaatleriServisi } from './services/calismaSaatleriServisi';
export { islemServisi } from './services/islemServisi';
export { kategoriServisi } from './services/kategoriServisi';
export { isletmeServisi } from './services/isletmeServisi';
export { personelServisi } from './services/personelServisi';
export { musteriServisi } from './services/musteriServisi';
export { randevuServisi } from './services/randevuServisi';
export { personelIslemleriServisi } from './services/personelIslemleriServisi';
export { profilServisi } from './services/profilServisi';
