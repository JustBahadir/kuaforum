
/**
 * Format a phone number string into a readable format
 * @param value Phone number as a string of digits
 * @returns Formatted phone number string (e.g., "0555 123 45 67")
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  
  // Remove non-digits
  const phoneNumber = value.replace(/\D/g, '');
  
  // Add spaces based on length
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
 * Returns only the digits from a phone number string
 * @param value Phone number string with potential formatting
 * @returns Phone number digits only
 */
export const stripPhoneFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};
