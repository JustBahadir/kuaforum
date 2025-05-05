
/**
 * Format a phone number with spaces (05XX XXX XX XX)
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  
  // Remove non-digits
  const phoneNumber = value.replace(/[^\d]/g, "");
  
  // Format with spaces based on length
  if (phoneNumber.length <= 4) {
    return phoneNumber;
  } else if (phoneNumber.length <= 7) {
    return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`;
  } else if (phoneNumber.length <= 9) {
    return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
  } else {
    return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 9)} ${phoneNumber.slice(9, 11)}`;
  }
};

/**
 * Strip non-digits from phone number
 */
export const normalizePhoneNumber = (value: string): string => {
  if (!value) return value;
  return value.replace(/[^\d]/g, "");
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (value: string): boolean => {
  if (!value) return true; // empty is ok
  
  const normalized = normalizePhoneNumber(value);
  
  // Turkish mobile phone validation (starts with 5, 10 digits)
  if (normalized.startsWith('5') && normalized.length === 10) {
    return true;
  }
  
  // If starts with 0 and is 11 digits (05xx format)
  if (normalized.startsWith('0') && normalized.length === 11 && normalized.charAt(1) === '5') {
    return true;
  }
  
  return normalized.length === 0 || normalized.length >= 10;
};

export default {
  formatPhoneNumber,
  normalizePhoneNumber,
  validatePhoneNumber
};
