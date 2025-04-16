
// Export types
export * from './types';

// Export services
import { personelServisi } from './services/personelServisi';
import { personelIslemleriServisi } from './services/personelIslemleriServisi';
import { islemServisi } from './services/islemServisi';
import { islemKategoriServisi } from './services/islemKategoriServisi';
import { randevuServisi } from './services/randevuServisi';
import { musteriServisi } from './services/musteriServisi';
import { dukkanServisi } from './services/dukkanServisi';
import { siralamaServisi } from './services/siralamaServisi';

// Import from local files if they exist, otherwise export empty objects for compatibility
let notificationServisi;
try {
  notificationServisi = require('./services/notificationServisi').notificationServisi;
} catch (e) {
  notificationServisi = {};
  console.warn('notificationServisi not found, using empty object');
}

export {
  personelServisi,
  personelIslemleriServisi,
  islemServisi,
  islemKategoriServisi,
  randevuServisi,
  musteriServisi,
  notificationServisi,
  dukkanServisi,
  siralamaServisi,
};
