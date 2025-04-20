
import { getProfile, getUserRole } from './profileServices/fetchProfile';
import { updateProfile } from './profileServices/updateProfile';
import { createProfile } from './profileServices/createProfile';  // Correct import, no createOrUpdateProfile

// Temiz IBAN için yardımcı fonksiyon
const cleanIBANForStorage = (iban?: string) => {
  if (!iban) return undefined;

  let cleaned = iban.replace(/\s/g, '');

  if (cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.substring(2).replace(/\D/g, '');
  } else {
    cleaned = 'TR' + cleaned.replace(/\D/g, '');
  }

  cleaned = cleaned.substring(0, 26);

  return cleaned;
};

// IBAN formatlaması
const formatIBAN = (iban: string) => {
  if (!iban) return '';

  let cleaned = iban.replace(/\s/g, '');

  if (cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.substring(2).replace(/\D/g, '');
  } else {
    cleaned = 'TR' + cleaned.replace(/\D/g, '');
  }

  cleaned = cleaned.substring(0, 26);

  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }

  return formatted;
};

// IBAN doğrulama (sadece TR ile başladığını ve sınırlandırmayı kontrol)
const validateIBAN = (iban: string) => {
  if (!iban) return '';

  let validated = 'TR';
  if (iban.startsWith('TR')) {
    validated += iban.substring(2).replace(/\D/g, '');
  } else {
    validated += iban.replace(/\D/g, '');
  }

  validated = validated.substring(0, 26);

  return validated;
};

export const profilServisi = {
  getir: getProfile,
  guncelle: (data: any) => {
    if (data.iban) {
      data.iban = cleanIBANForStorage(data.iban);
    }
    return updateProfile(data);
  },
  getUserRole,
  createProfile: (userId: string, data: any) => {
    if (data.iban) {
      data.iban = cleanIBANForStorage(data.iban);
    }
    return createProfile(userId, data);
  },
  formatIBAN,
  cleanIBANForStorage,
  validateIBAN,
};
